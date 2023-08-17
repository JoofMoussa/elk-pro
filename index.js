const express = require("express");
const app = express();

const axios = require("axios");
const esUrl = "http://localhost:9200/";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const cors = require('cors');
app.use(cors());

const path = require("path");

const port = 3003;

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    const query = req.query;
    res.sendFile(path.join(__dirname, "public", "index.html"), {
        query: JSON.stringify(query),
    });
});

app.post("/Create", async(req, res) => {
    try {
        const verifierIndex = async() => {
            try {
                await axios.head(`${esUrl}${req.body.index}`);
                return true;
            } catch (error) {
                return false;
            }
        };

        const siIndexExiste = await verifierIndex();
        if (!siIndexExiste) {
            const esResponse = await axios.put(`${esUrl}${req.body.index}`, {
                mappings: {
                    properties: {
                        nom: {
                            type: "text",
                        },
                        email: {
                            type: "text",
                            fields: {
                                raw: {
                                    type: "keyword",
                                },
                            },
                        },
                        pays: {
                            type: "text",
                        },
                        age: {
                            type: "integer",
                        },
                        agence: {
                            type: "text",
                        },
                        fonction: {
                            type: "text",
                        },
                        description: {
                            type: "text",
                        },
                        inscription: {
                            type: "date",
                            fields: {
                                raw: {
                                    type: "keyword",
                                },
                            },
                        },
                    },
                },
            });
            res.json(esResponse.data);
        } else {
            res.json("Cet index existe");
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

// Insertion des donnees avec Bulk: fichier data.json
app.post("/data", async(req, res) => {
    try {
        const mesDonnees = require("./data.json");
        const tailleDonnees = mesDonnees.length;
        for (let idx = 0; idx < tailleDonnees; idx++) {
            await axios.post(`${esUrl}${req.body.index}/_doc`, mesDonnees[idx]);
        }

        res.json("**** Donnees Inserees ****");
    } catch (error) {
        res.status(500).json(error);
    }
});


// // Recuperer les donnees
app.get("/Read/:index/:id", async(req, res) => {
    try {
        const esResponse = await axios.get(`${esUrl}${req.params.index}/_doc/${req.params.id}`);
        res.json(esResponse.data);
    } catch (error) {
        res.status(500).json(error);
    }
});

// // Mis a jour des donnees
app.put("/Update/:index/:id", async(req, res) => {
    try {
        const esResponse = await axios.put(`${esUrl}${req.params.index}/_doc/${req.params.id}`, req.body);
        res.json(esResponse.data);
    } catch (error) {
        res.status(500).json(error);
    }
});

// Suppression des donnees
app.delete("/Delete/:index/:id", async(req, res) => {
    try {
        const esResponse = await axios.delete(`${esUrl}${req.params.index}/_doc/${req.params.id}`);
        res.json(esResponse.data);
    } catch (error) {
        res.status(500).json(error);
    }
});

// Add this route before your app.listen()

app.get("/getAllData", async(req, res) => {
    try {
        const esResponse = await axios.get(`${esUrl}_search`);
        const hits = esResponse.data.hits.hits;
        const allData = hits.map(hit => hit._source);
        res.json(allData);
    } catch (error) {
        res.status(500).json(error);
    }
});


app.get("/data/:index", async(req, res) => {
    try {
        let response;
        const test = req.query.test;

        switch (test) {
            case "sorting":
                response = await axios.post(`${esUrl}${req.params.index}/_search`, {
                    sort: {
                        inscription: "desc",
                    },
                });
                break;

            case "matching":
                response = await axios.post(`${esUrl}${req.params.index}/_search`, {
                    query: {
                        match: {
                            pays: "samoa",
                        },
                    },
                });
                break;

            case "multi-matching":
                response = await axios.post(`${esUrl}${req.params.index}/_search`, {
                    query: {
                        bool: {
                            must: [{
                                    match: {
                                        nom: "Anastacio Stamm",
                                    },
                                },
                                {
                                    match: {
                                        pays: "Samoa",
                                    },
                                },
                            ],
                        },
                    },
                });
                break;

            default:
                response = await axios.get(`${esUrl}${req.params.index}/_search`);
                break;
        }

        res.json(response.data);
    } catch (error) {
        res.json(error);
    }
});
// Voir si l index existe
// curl -I "localhost:9200/my-data-stream?pretty"
app.get("/", (req, res) => {
    res.send("Serveur en marche!");
});

// Lancement du serveur
app.listen(3003, () => {
    console.log('Serveur en écoute sur le port : http://localhost:3003/');
});