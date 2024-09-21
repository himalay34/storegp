module.exports.boot = (app) => {
  app.post("/__space/v0/actions", (req, res) => {
    const event = req.body.event;

    if (event.id === "cleanup") {
      //cleanup();
    }

    res.status(200).send(event);
  });
};

/*
Specfile

micros:
  - name: backend
    src: backend
    engine: nodejs16
    run: "node index.js"
    actions:
      - id: "cleanup"
        name: "Clean Up"
        description: "Cleans up unused data"
        trigger: "schedule"
        default_interval: "0/15 * * * *"

        */
