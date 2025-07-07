<<<<<<< HEAD
// Async handler utility 

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
};

=======
// Async handler utility 

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
};

>>>>>>> 55b0194c2d6ec825affe8c8a53a320b6496ad045
export { asyncHandler }; 