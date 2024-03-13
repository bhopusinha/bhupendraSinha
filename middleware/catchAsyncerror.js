// catchAsyncerror middleware
const catchAsyncerror = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsyncerror;
