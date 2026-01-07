/*
--Takes an async fn -> catches an error -> sends them to express error middleware--
--avoids using try catch again & again--
*/
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
