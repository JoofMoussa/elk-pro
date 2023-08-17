const express = require("express");
const app = express();

const axios = require("axios");
const esUrl = "http://localhost:9200/";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//insertion des donnees avec Bulk : fichier data.json

app.post("/data", async(req, res) => {
    try {
        const mesDonnees = require("data.json");
        const tailleDonnees = mesDonnees.length;
        for (let idx = 0; idx < tailleDonnees; idx++) { // 
            await axios.post(`${esUrl}${req.body.index}/_doc`, mesDonnees[idx]);
        }

        res.json("**** Donnees Inserees ****");
    } catch (error) {
        res.status(500).json(error);
    }
});




app.post("/Create", async(req, res) => {
    try {
        const verifierIndex = () =>
            new Promise((resolve) => {
                axios
                    .get(`${esUrl}${req.body.index}`)
                    .then((_) => {
                        resolve(true);
                    })
                    .catch(() => {
                        resolve(false);
                    });
            });

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

// Recuperer les donnees

app.get("/Read/:index/:id", async(req, res) => {
    try {
        const esResponse = await axios.get(`${esUrl}${req.params.index}/_doc/${req.params.id}`);
        res.json(esResponse.data);
    } catch (error) {
        res.status(500).json(error);
    }
});

// Mis a jour des donnees
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

app.get("/", (req, res) => {
    res.send("Serveur en marche!");
});


//Lancement du serveur
app.listen(3003, () => {
    console.log('Serveur en écoute sur le port : http://localhost:3003/');
});