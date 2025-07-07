<<<<<<< HEAD
import CategoryModel from '../models/category.model.js';

const CategoryService = {
    async getCategories(filters = {}) {
        return CategoryModel.findAll(filters);
    }
};

=======
import CategoryModel from '../models/category.model.js';

const CategoryService = {
    async getCategories(filters = {}) {
        return CategoryModel.findAll(filters);
    }
};

>>>>>>> 55b0194c2d6ec825affe8c8a53a320b6496ad045
export default CategoryService; 