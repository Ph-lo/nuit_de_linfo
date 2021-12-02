const express = require("express");
const app = express();
const port = process.env.PORT || 8000;

app.get("/cal", (req, res) => {
  
    console.log(req.params.calcul)
});

app.listen(port, () => {
  console.log("Server app listening on port " + port);
});
