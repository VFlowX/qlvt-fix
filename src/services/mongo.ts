import axios from "axios";

export async function userUpdateOne({ db = "CSDL_QLVT", collection, filterObj = {}, dataMongo }) {
  let data = JSON.stringify({
    query: `mutation add($token: String, $db: String, $collection: String, $body: JSON, $filter: JSON, $sort: JSON, $skip: Int, $actionCode: String) {
      userUpdateOne: userUpdateOne(token: $token, db: $db, collection: $collection, body: $body, filter: $filter, sort: $sort, skip: $skip, actionCode: $actionCode)
    }`,
    variables: {
      token: process.env.TOKEN,
      db: "CSDL_QLVT",
      collection: collection,
      body: dataMongo,
      filter: filterObj
    }
  });

  let config = {
    method: 'post',
    url: 'https://qlvt.mt.gov.vn/vuejx/',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  };

  return await axios.request(config)
    .then((response) => {
      return response.data
    })
    .catch((error) => {
      console.log(error);
    });
}

