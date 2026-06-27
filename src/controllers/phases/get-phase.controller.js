const {
  fetchPhaseSuccessResponse
} = require(
  "@responses/success/phase.response"
);

const getPhaseController = (
  req,
  res
) => {

  return fetchPhaseSuccessResponse(
    res,
    req.params.phaseType,
    req.phase,
    `${req.params.phaseType} phase details fetched successfully`
  );

};

module.exports = {
  getPhaseController
};