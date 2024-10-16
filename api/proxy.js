const axios = require('axios');

module.exports = async (req, res) => {
  const { path } = req.query;
  try {
    const response = await axios.get(`https://api.solanabeach.io/v1${path}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': process.env.REACT_APP_SOLANA_BEACH_API_KEY
      }
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: error.message });
  }
};
