const {
  createObjectToDeliver,
  createPayloadCheck,
} = require('../commons/controller-helpers');
const AppError = require('../errorhandling/error-model');
const Category = require('../category/category-model');

const requiredProperties = ['name'];
const allowedProperties = ['_id', 'name', 'index'];
const deliveredProperties = ['_id', 'name'];
const checkPayloadProps = createPayloadCheck(requiredProperties, allowedProperties);

const categoryCtrl = {
  create: async (category, authUser) => {
    try {
      checkPayloadProps(category, 'create');

      let anotherCategoryWithThatName = await Category.find({
        name: category.name,
      });

      if (anotherCategoryWithThatName && anotherCategoryWithThatName.length > 0)
        throw new AppError(400, 'category with that name already exists');
      
      let createdCategory = null;
      createdCategory = await Category.create(category);

      return await prepareCategoryForDelivery(createdCategory, authUser);
    } catch (e) {
      throw new AppError(e);
    }
  },
  findAll: async (authUser) => {
    try {
      let categories = await Category.find({}).sort('index').exec();
      let result = [];
      if (categories && categories.length > 0) {
        for (let category of categories)
          result.push(await prepareCategoryForDelivery(category, authUser));
      }
      return result;
    } catch (e) {
      throw new AppError(e);
    }
  },
  findById,

  update: async (id, newValues, authUser) => {
    try {
      checkPayloadProps(newValues, 'update');

      let currentCategory = await Category.findById(id);
      if (!currentCategory) {
        throw new AppError(404, 'Category not found');
      }

      for (let key in newValues) {
        currentCategory[key] = newValues[key];
      }

      await currentCategory.save();
      return await prepareCategoryForDelivery(currentCategory, authUser);
    } catch (e) {
      throw new AppError(e);
    }
  },

  delete: async (id) => {
    try {
      let currentCategory = await Category.findById(id);
      if (!currentCategory) {
        throw new AppError(404, 'Category not found');
      }
      return await currentCategory.remove();
    } catch (e) {
      throw new AppError(e);
    }
  },
  getDemands,
  addDemand,
  removeDemand,
  createDefaultCategories,
  removeExpiredDemands
};

async function findById(id, authUser) {
  try {
    let category = await Category.findById({ _id: id }).exec();
    if (category)
      return await prepareCategoryForDelivery(category, authUser);
    else
      return null;
  } catch (e) {
    throw new AppError(e);
  }
}

async function getDemands(categoryId) {
  let category = await Category.findById(categoryId);
  if (!category || !category.reportedDemands)
    return null;
  return category.reportedDemands;
}

async function addDemand(categoryId, authUser) {
  let category = await Category.findById(categoryId);
  let result = { };
  if (!category)
    throw new AppError(404, 'Category does not exist.');
    
  if (!category.reportedDemands.map(x => x.userId).includes(authUser.id)) {
    let demand = {
      userId: authUser.id
    };
    category.reportedDemands.push(demand);
    await category.save();
  }
  result.userDemands = category.reportedDemands.map(x => x.userId).includes(authUser.id);
  result.demandsCount = category.reportedDemands.length;
  return result;
}

async function removeDemand(categoryId, authUser) {
  let category = await Category.findById(categoryId);
  let result = { };
  if (!category)
    throw new AppError(404, 'Category does not exist.');
  let index = category.reportedDemands.map(x => x.userId).findIndex((element) => element.toString() === authUser.id.toString());
  if (index >= 0) {
    category.reportedDemands.splice(index, 1);
    await category.save();
  }
  result.userDemands = category.reportedDemands.map(x => x.userId).includes(authUser.id);
  result.demandsCount = category.reportedDemands.length;
  return result;
}

async function prepareCategoryForDelivery(category, authUser) {
  let deliveredProps = ['userDemands', 'demandsCount', ...deliveredProperties];
  if (!category.reportedDemands)
    category.reportedDemands = [];
  category.userDemands = category.reportedDemands.map(x => x.userId).includes(authUser.id);
  category.demandsCount = category.reportedDemands.length;
  category = createObjectToDeliver(category, deliveredProps);
  return category;
}

async function createDefaultCategories(categories) {
  for (let idx = 0; idx < categories.length; idx++) {
    let cat = categories[idx];
    cat.index = idx;
    await categoryCtrl.create(cat, 'none');
  }
}

async function removeExpiredDemands(demandsExpireTime) {
  let categories = await Category.find({}).sort('index').exec();
  let compareDate = new Date();
  categories.forEach(async (category) => {
    await category.reportedDemands.forEach(async (demand) => {
      let demandTS = new Date(demand.timestamp);
      demandTS.setTime(demandTS.getTime() + demandsExpireTime * 86400000);
      if (demandTS <= compareDate) {
        await removeDemand(category._id, { id: demand.userId });
      }
    });
  });
}

module.exports = categoryCtrl;
