import express from "express";
import bodyParser from "body-parser";
import axios from 'axios';
import pg from "pg";

// Initialize Express and set the port to 3000.
const app = express();
const port = 3000;

// Create a new PostgreSQL client with connection details from .env.
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "mindus",
    password: "2005",
    port: 5432,
});

// Connect to the PostgreSQL database
db.connect();

// Set up middleware for parsing URL-encoded bodies and serving static files.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let title,desc,author,ISBN,rating,editBookid,searchTitle;

app.get("/",(req,res)=>{
    res.render("index.ejs");
});

app.get("/add",(req,res)=>{
    res.render("new-book.ejs");
});

app.get("/view",(req,res)=>{
  res.render("view-book.ejs");
});


app.post("/addBook",async(req,res)=>{ 
   title = req.body.bookTitle;
   desc = req.body.bookDesc;
   author = req.body.authorName;
   ISBN = req.body.isbn;
   rating = req.body.bookRat;
  
    try {
        
        await db.query(
          "INSERT INTO book (booktitle, author, description, rating,isbn) VALUES ($1, $2, $3, $4,$5)", 
          [title,author,desc,rating,ISBN]
        );
        res.redirect("/");

      } catch (err) {
        console.log(err);
      }
    
});

app.post("/sort",async(req,res)=>{ 
  const sort = req.body.sort;

  try {
      
      if (sort == 1) {
        try {
          const result = await db.query(
            "SELECT * FROM BOOK ORDER BY booktitle ASC"
          );
          res.render("view-book.ejs",{
            books : result.rows
          });
        } catch (error) {
            console.log(error);
        }

      } 
      else if(sort == 2){
        try {
          const result = await db.query(
            "SELECT * FROM BOOK ORDER BY dateent DESC"
          );
          res.render("view-book.ejs",{
            books : result.rows
          });

        } catch (error) {
            console.log(error);
        }
      }
      else if(sort == 3){
        try {
          const result = await db.query(
            "SELECT * FROM BOOK ORDER BY rating DESC"
          );
          console.log(result.rows);
          res.render("view-book.ejs",{
            books : result.rows
          });

        } catch (error) {
            console.log(error);
        }
      }
      
      else {
        try {
          const result = await db.query(
            "SELECT * FROM BOOK ORDER BY author ASC"
          );
          res.render("view-book.ejs",{
            books : result.rows
          });
          
          
        } catch (error) {
            console.log(error);
        }
      }


    } catch (err) {
      console.log(err);
    }
  
});

app.post("/delete",async(req,res)=>{
  const delBook = req.body.deleteBook;
  await db.query(
    "DELETE FROM book WHERE id = ($1)",
    [delBook]
  );
  res.redirect("/");
});


app.post("/edit",async(req,res)=>{
  editBookid = req.body.editBook;
  console.log(editBookid);

  res.redirect("/editBook");
});

app.get("/editBook",async(req,res)=>{
  try {
    const result = await db.query(
      "SELECT * FROM BOOK WHERE id = ($1)",
      [editBookid]
    );
    
    console.log(editBookid);
  
    res.render("edit-book.ejs",{
      id : editBookid,
      books : result.rows[0]
    });
  } catch (error) {
    console.log(error);
  }
  
});

app.post("/edited",async(req,res)=>{
  const eid = req.body.eId;
  const etitle = req.body.ebookTitle;
  const edesc = req.body.ebookDesc;
  const eauthor = req.body.eauthorName;
  const eISBN = req.body.eisbn;
  const erating = req.body.erating;
  console.log(eid);

  try {
    await db.query(
      // "UPDATE book SET booktitle = ($1), author = ($2),description = ($3),rating = ($4),isbn = ($5) WHERE id = ($6)",
      // [etitle,eauthor,edesc,erating,eISBN,eid]
      "UPDATE book SET booktitle = ($1), author = ($2),description = ($3),rating = ($4),isbn = ($5) WHERE id = ($6)",
      [etitle,eauthor,edesc,erating,eISBN,eid]
    );
  } catch (error) {
    console.log(error);
  }
  res.redirect("/");
  
});

app.post("/search",(req,res)=>{

  searchTitle = req.body.sTitle;
  
  res.redirect("/searchPost");
})

app.get("/searchPost",async(req,res)=>{
  try {
    const result = await db.query(
      "SELECT * FROM BOOK WHERE booktitle = ($1)",
      [searchTitle]
    );
  
    res.render("search-book.ejs",{
      book : result.rows[0]
    });
  } catch (error) {
    console.log(error);
  }
})


// Start the server and listen on port 3000.
app.listen(port, () => {
    console.log('Server running on port http://localhost:3000');
});


