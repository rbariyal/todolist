//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash")
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://rbariyal64:Rahul786@cluster0.onn0t.mongodb.net/todolistDB");


const itemsSchema=
{
  name:String
}

const Item=mongoose.model("Item",itemsSchema)

const item1=new Item(
  {
    name:"Welcome to to do list "
  });
  const item2=new Item(
  {
    name:"Hit the + button to add a new item"
  });
  const item3=new Item(
  {
    name:"<-- Hit this to delete an item"
  }
);

const defaultItems=[item1,item2,item3]

const listSchema=
{
  name:String,
  items:[
    itemsSchema
  ]
};

const List=mongoose.model("List",listSchema)



app.get("/", function(req, res) {

  Item.find({},function(err,result)
  {
    if(result.length===0)
    {
      Item.insertMany(defaultItems,(err)=>
      {
      if(err)
      {
        console.log(err);
      }
      else
      {
        console.log("successfully saved the default items to DB")
      }
      });
      res.redirect("/");
    }
    else
    {
      res.render("list", {listTitle: "Today", newListItems: result});
    }
  });


 

});

app.post("/", function(req, res){

  const itemname = req.body.newItem;
  const listName=req.body.list;

  const item=new Item(
    {
      name:itemname
    }
  );

  if(listName==="Today")
  {
    item.save();
    res.redirect("/");
  }

  else
  {
List.findOne({name:listName},(err,foundlist)=>
{
  foundlist.items.push(item);
  foundlist.save();
  res.redirect("/" + listName);
})

  }

  
});

app.get("/:customlistname",(req,res)=>
{
  const customlistname=_.capitalize(req.params.customlistname);
  

List.findOne({name:customlistname},(err,foundlist)=>
{
if(!err)
{
  if(!foundlist)
  {
    const list=new List(
      {
        name:customlistname,
        items:defaultItems
      }
    )
    list.save();
    res.redirect("/" + customlistname)
  }
  else
  {
  //show an existing list
  res.render("list",{listTitle:foundlist.name,newListItems:foundlist.items})
  }
}
});



  

})

app.post("/delete",(req,res)=>
  {
    const checkedItemId=req.body.checkbox
    const listName=_.capitalize(req.body.listName);
    if(listName==="Today")
    {

      Item.findByIdAndRemove(checkedItemId,(err)=>
      {
        if(!err)
        {
          console.log("sucessfully deleted the checked item ")
          res.redirect("/");
        }
      });
    }
    else
    {

List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},
(err,foundlist)=>
{
if(!err)
{
  res.redirect("/" + listName);
}
});


    }
  
  });


  let port=process.env.PORT;
  if(port==null || port=="")
  {
    port=3000;
  }

app.listen(port, function() {
  console.log(`Server has started successfully on ${port}  `);
});
