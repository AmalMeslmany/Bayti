const ContactMessage = require("../models/ContactMessage");
const Property = require("../models/Property");
const PropertyReport = require("../models/PropertyReport");
const User = require("../models/User");
const { deletePropertyImages } = require("../utils/supabaseStorage");
const { serializeProperty } = require("./propertyController");

function getPropertyImages(property) {
  if (property.images?.length) {
    return property.images;
  }

  return property.imagePath ? [{ url: property.image, path: property.imagePath }] : [];
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function getAdminSummary(req, res) {
  const [
    totalUsers,
    totalProperties,
    hiddenProperties,
    contactMessages,
    users,
    properties,
  ] = await Promise.all([
    User.countDocuments(),
    Property.countDocuments(),
    Property.countDocuments({ isHidden: true }),
    ContactMessage.countDocuments(),
    User.find().sort({ createdAt: -1 }).limit(5).select("-password"),
    Property.find().sort({ createdAt: -1 }).limit(5).populate("owner", "firstName lastName email"),
  ]);

  const favoriteTotals = await User.aggregate([
    { $project: { count: { $size: { $ifNull: ["$favorites", []] } } } },
    { $group: { _id: null, total: { $sum: "$count" } } },
  ]);

  return res.json({
    status: "success",
    stats: {
      totalUsers,
      totalProperties,
      totalFavorites: favoriteTotals[0]?.total || 0,
      totalContactMessages: contactMessages,
      hiddenProperties,
      activeProperties: totalProperties - hiddenProperties,
    },
    latestUsers: users,
    latestProperties: properties.map(serializeProperty),
  });
}

async function getAdminProperties(req, res) {
  const { search = "", owner = "", city = "", status = "" } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { title: new RegExp(search, "i") },
      { description: new RegExp(search, "i") },
      { location: new RegExp(search, "i") },
    ];
  }

  if (owner) {
    const escapedOwner = escapeRegExp(owner);
    const ownerPattern = new RegExp(escapedOwner, "i");
    const matchingOwners = await User.find({
      $or: [
        { firstName: ownerPattern },
        { lastName: ownerPattern },
        { email: ownerPattern },
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ["$firstName", " ", "$lastName"] },
              regex: escapedOwner,
              options: "i",
            },
          },
        },
      ],
    }).select("_id");

    query.owner = { $in: matchingOwners.map((user) => user._id) };
  }

  if (city) query.location = new RegExp(city, "i");
  if (status === "hidden") query.isHidden = true;
  if (status === "active") query.isHidden = { $ne: true };

  const properties = await Property.find(query)
    .sort({ createdAt: -1 })
    .populate("owner", "firstName lastName email");

  return res.json({
    status: "success",
    properties: properties.map(serializeProperty),
  });
}

async function setPropertyHidden(req, res) {
  const { id } = req.params;
  const { isHidden } = req.body;

  const property = await Property.findById(id);
  if (!property) return res.status(404).json({ status: "error", message: "Property not found." });

  property.isHidden = Boolean(isHidden);
  property.hiddenBy = property.isHidden ? req.user._id : undefined;
  property.hiddenAt = property.isHidden ? new Date() : undefined;
  await property.save();

  return res.json({ status: "success", property: serializeProperty(property) });
}

async function deleteAdminProperty(req, res) {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ status: "error", message: "Property not found." });

  await User.updateMany({}, { $pull: { favorites: property._id } });
  await PropertyReport.deleteMany({ property: property._id });
  await property.deleteOne();
  await deletePropertyImages(getPropertyImages(property).map((image) => image.path).filter(Boolean));

  return res.json({ status: "success", message: "Property deleted successfully." });
}

async function deleteAdminPropertyImage(req, res) {
  const { id } = req.params;
  const { imagePath } = req.body;
  const property = await Property.findById(id);

  if (!property) return res.status(404).json({ status: "error", message: "Property not found." });
  if (!imagePath) return res.status(400).json({ status: "error", message: "Image path is required." });

  property.images = getPropertyImages(property).filter((image) => image.path !== imagePath);
  property.image = property.images[0]?.url || "";
  property.imagePath = property.images[0]?.path || "";
  await property.save();
  await deletePropertyImages([imagePath]);

  return res.json({ status: "success", property: serializeProperty(property) });
}

async function getAdminUsers(req, res) {
  const { search = "" } = req.query;
  const query = search
    ? {
        $or: [
          { firstName: new RegExp(search, "i") },
          { lastName: new RegExp(search, "i") },
          { email: new RegExp(search, "i") },
        ],
      }
    : {};
  const users = await User.find(query).sort({ createdAt: -1 }).select("-password");
  const counts = await Property.aggregate([{ $group: { _id: "$owner", count: { $sum: 1 } } }]);
  const countMap = new Map(counts.map((item) => [String(item._id), item.count]));

  return res.json({
    status: "success",
    users: users.map((user) => ({ ...user.toObject(), propertyCount: countMap.get(String(user._id)) || 0 })),
  });
}

async function updateAdminUser(req, res) {
  const { role, isDisabled } = req.body;
  const user = await User.findById(req.params.id).select("-password");

  if (!user) return res.status(404).json({ status: "error", message: "User not found." });
  if (role && ["user", "admin"].includes(role)) user.role = role;
  if (typeof isDisabled === "boolean") user.isDisabled = isDisabled;
  await user.save();

  return res.json({ status: "success", user });
}

async function deleteAdminUser(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ status: "error", message: "User not found." });

  const properties = await Property.find({ owner: user._id });
  const imagePaths = properties.flatMap((property) =>
    getPropertyImages(property).map((image) => image.path).filter(Boolean),
  );

  await PropertyReport.deleteMany({ property: { $in: properties.map((property) => property._id) } });
  await Property.deleteMany({ owner: user._id });
  await User.updateMany({}, { $pull: { favorites: { $in: properties.map((property) => property._id) } } });
  await user.deleteOne();
  await deletePropertyImages(imagePaths);

  return res.json({ status: "success", message: "User deleted successfully." });
}

async function getContactMessages(req, res) {
  const messages = await ContactMessage.find().sort({ createdAt: -1 });
  return res.json({ status: "success", messages });
}

async function updateContactMessage(req, res) {
  const message = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { isRead: Boolean(req.body.isRead) },
    { new: true },
  );
  if (!message) return res.status(404).json({ status: "error", message: "Message not found." });
  return res.json({ status: "success", message });
}

async function deleteContactMessage(req, res) {
  await ContactMessage.findByIdAndDelete(req.params.id);
  return res.json({ status: "success", message: "Contact message deleted." });
}

async function getReports(req, res) {
  const reports = await PropertyReport.find()
    .sort({ createdAt: -1 })
    .populate("property", "title location isHidden")
    .populate("reporter", "firstName lastName email");
  return res.json({ status: "success", reports });
}

async function dismissReport(req, res) {
  const report = await PropertyReport.findByIdAndUpdate(
    req.params.id,
    { status: "dismissed" },
    { new: true },
  );
  if (!report) return res.status(404).json({ status: "error", message: "Report not found." });
  return res.json({ status: "success", report });
}

module.exports = {
  deleteAdminProperty,
  deleteAdminPropertyImage,
  deleteAdminUser,
  deleteContactMessage,
  dismissReport,
  getAdminProperties,
  getAdminSummary,
  getAdminUsers,
  getContactMessages,
  getReports,
  setPropertyHidden,
  updateAdminUser,
  updateContactMessage,
};
