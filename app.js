const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

function getCurrentDate() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const currentDate = new Date();
  const day = days[currentDate.getDay()];
  const month = months[currentDate.getMonth()];
  const date = currentDate.getDate();
  const year = currentDate.getFullYear();

  return `${day}, ${month} ${date}, ${year}`;
}


async function connectToDB() {
  const password = encodeURIComponent('12@sourav');
  const dbName = 'todoList';
  const uri = `mongodb+srv://admin-sourav03:${password}@cluster0.j0fqaib.mongodb.net/${dbName}?retryWrites=true&w=majority`;

  try {
    await mongoose.connect(uri, { useNewUrlParser: true });
    console.log("Connected to MongoDB Atlas");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
}

// Call the function to connect to the database
connectToDB().catch(error => console.error(error));

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "Complete Assignment"
});

const item2 = new Item({
  name: "Clean the room. "
});
/*
const item3 = new Item({
  name: "Hit this to delete an item."
});*/
const defaultItems = [];
/*const listSchema={
  name: String,
  items: [itemsSchema]
};
const List= mongoose.model("List",listSchema);*/
app.get("/", async function (req, res) {
  const currentDate = getCurrentDate();
  try {
    const items = await Item.find({});
    
    if (items.length === 0) {
      // Inserting default items if the database is empty
      async function insertDefaultItems() {
        try {
          await Item.insertMany(defaultItems);
          console.log("Default items inserted");
        } catch (error) {
          console.error("Error inserting default items:", error);
        }
      }
      insertDefaultItems().catch(error => console.error(error));
      console.log("Default items inserted");
    }
    res.render("list.ejs", { currentDayDate: currentDate, listTitle: "To-do List", newListItems: items });
  } catch (err) {
    console.error("Error retrieving items:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/", async function (req, res) {
  const itemName = req.body.newItem;
  const item = new Item({
    name: itemName
  });

  try {
    await item.save();
    console.log("New item added:", itemName);
    res.redirect('/');
  } catch (err) {
    console.error("Error saving item:", err);
    res.status(500).send("Internal Server Error");
  }
});


app.post("/delete", async function (req, res) {
  const checkedItem = req.body.checkboxName.trim(); // Remove leading/trailing spaces
  try {
    const result = await Item.findByIdAndDelete(checkedItem);
    // Log the result of the deletion operation
    console.log("Successfully Removed!", result.name);
    res.redirect("/");
  } catch (err) {
    console.error("Error removing item:", err);
    res.status(500).send("Internal Server Error");
  }
});
/* As of now commenting out the customPage   
app.get("/:customListName", async function (req, res) {
  const customListName = req.params.customListName;
  try {
    // Check if the list already exists in the database
    const foundList = await List.findOne({ name: customListName }).exec();
    if (!foundList) {
      console.log("Doesn't Exists!");
      // ... Handle the case when the list doesn't exist ...
      const list=new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/"+customListName);
    } else {
      console.log("Exists!");
      // ... Handle the case when the list exists ...
      res.render("list.ejs", { listTitle: foundList.name, newListItems: foundList.items });
    }
  } catch (err) {
    console.error("Error retrieving list:", err);
    res.status(500).send("Internal Server Error");
  }
});
*/
app.listen(3000, function () {
  console.log("Server started on port 3000");
});
