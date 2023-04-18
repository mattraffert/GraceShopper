const express = require('express');
const productsRouter = express.Router();
const {
	getAllProducts,
	getProductByTitle,
	createProduct,
	getProductById,
	updateProduct,
	destroyProduct
} = require('../db/products');
const { getReviewByProduct } = require('../db/reviews');
const { requireUser } = require('./require');

productsRouter.get('/', async (req, res, next) => {
	try {
		const allProducts = await getAllProducts();

		if (allProducts) {
			res.send(allProducts);
		} else {
			res.send({ message: 'No products found' });
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

productsRouter.post('/', requireUser, async (req, res, next) => {
	try {
		const { title, description, price, inventory, petType } = req.body;
		const exists = await getProductByTitle(title)

		if (exists) {
			next({ 
				error: "Name already exists",
				message: `A product with name ${title} already exists`,
				name: "Error"
			});
		}

		if (title && description && price && inventory && petType) {
			const newProduct = await createProduct({ title, description, price, inventory, petType });
			res.send(newProduct);
		} else {
			res.send({ message: 'Missing fields' });
		}

	} catch ({ name, message }) {
		next({ name, message });
	}
});

productsRouter.patch('/:productId', requireUser, async (req, res, next) => {
	const { title, description, price, inventory, petType } = req.body;
	const { productId } = req.params;
	const existsId = await getProductById(productId)
	const existsTitle = await getProductByTitle(title)

	try {

		if (!existsId) {
			res.send({ 
				error: "No product",
				message: `Product ${productId} not found`,
				name: "Error"
			});
		}

		if (existsTitle) {
			res.send({ 
				error: "Name already exists",
				message: `An product with name ${title} already exists`,
				name: "Error"
			});
		}

		if (productId || title || description || price || inventory || petType) {
			const updatedProduct = await updateProduct({
				id: productId,
				title,
				description,
				price,
				inventory,
				petType
			});
			res.send(updatedProduct);
		} else {
			res.send({ message: 'Missing fields' });
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

productsRouter.get('/:productId/reviews', async (req, res, next) => {
	const { itemId } = req.params;
	const id = parseInt(itemId);
	const existsId = await getProductById(itemId)

	try {
		const ProductReviews = await getReviewByProduct({ id });

		if (!existsId) {
			res.send({ 
				error: "No product",
				message: `Product ${itemId} not found`,
				name: "Error"
			});
		}

		if (ProductReviews.length > 0) {
			res.send(ProductReviews);
		} else {
			res.send({ message: 'No matching reviews found' });
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

productsRouter.delete('/:productId', requireUser, async (req, res, next) => {
	const { productId } = req.params;
	try {
		const deletedRoutine = await destroyProduct(productId);
		res.send(deletedRoutine);
	} catch ({ name, message }) {
		next({ name, message });
	}
});

module.exports = { productsRouter };
