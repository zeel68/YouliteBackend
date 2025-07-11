import { fs } from "fs";

const axios = require('axios');
let data = '<file contents here>';

let config = {
    method: 'put',
    maxBodyLength: Infinity,
    url: 'https://graph.microsoft.com/v1.0/users/48356fb4-4155-4a2e-9d37-6d600249f8b5/drive/root:/Student/logo.png:/content',
    headers: {
        'Authorization': 'Bearer .Y_E9d-VftmSI-Ak4Uuf1xW7HwWyhVRw21nVgEP9I9JpbhafJ7yCabWfOqxLb5bLYWW_AZp0GFIWchJXLzdYW4JW7OPaOmJNJfmuztAQSeQzhXvkSJYRoKaDSgJ_0EWZgjYrRds3WGDQThO8AQ4QBhcX6KLQ8858oPfljTfW80Mv7DCHOjRh9-ppYr1humSF6jpAerSag-Bmv3ShGJcBzUYccd6DUA5X6gI2rVZeCc1CEuDxTU4zRQpkmCTRcCi4YO_F_X8GfqEtbLc7yE6iui5qfdFLr2ulMl5JpPJ4XTYsSC2Th8ega_FfcUFa-IOmWSmbVaduwQ2B3WgeyN3OlLA',
        'Content-Type': 'image/png'
    },
    data: data
};

axios.request(config)
    .then((response) => {
        console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
        console.log(error);
    });



const uploadOnOneDrive = async (localFilePath) => {
    try {
        if (!localFilePath) return "File Does not exist";

    } catch (e) {

    }
}