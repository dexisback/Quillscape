


import express from "express";
import axios from "axios";
import { verifyAuth } from "../middleware/auth.js";
import Blog from "../models/Blog.js";
import User from "../models/User.js";




const router= express.Router();


//test:
router.get("/", (req, res)=>{
    console.log("testing route works, this was only meant for the developer")
    res.send("hellow, youre in the /blog endpoint")
})


//get all public blogs with author info
router.get("/public", async (req, res) => {
    try {
        const blogs = await Blog.find({}).sort({ createdAt: -1 }).limit(50);
        
        //get author emails for each blog
        const blogsWithAuthors = await Promise.all(
            blogs.map(async (blog) => {
                const author = await User.findOne({ firebaseUid: blog.author_uid });
                return {
                    ...blog.toObject(),
                    author_email: author ? author.email : 'Anonymous'
                };
            })
        );
        
        res.status(200).json(blogsWithAuthors);
    } catch (err) {
        console.error("failed to fetch public blogs", err);
        res.status(500).send({ msg: "server error fetching public blogs" });
    }
});




router.get("/me", verifyAuth, async (req, res)=>{
try {
    const userBlogs= await Blog.find({author_uid : req.user.uid}); //finds all the blogs of the user
    res.status(201).json(userBlogs)         
} catch (error) {
    console.error("sorry no blogs of the user exist!")
}

})


//creating a blog:
router.post("/post", verifyAuth, async (req, res)=>{
    try {
    const { title, body } = req.body;
    const newBlog= new Blog({
        title,
        body,
        author_uid : req.user.uid
    })
    await newBlog.save();
    res.status(201).send({msg: "your blog has been posted"});
    console.log("blog has been created");
} catch (error) {
        console.error("sorry nigga you are either not authenticated or some shi")
    }
})


//deleting a particular blog
router.delete("/delete/:id", verifyAuth, async(req, res)=>{
    try {
        const blog_id=req.params.id;
    const author_uid=req.user.uid;
    //findOneAndDelete prevents user B from deleting user A's blog even tho if they have user A's credentials
    const deletedBlogs= await Blog.findOneAndDelete({
        _id: blog_id,
        author_uid : author_uid
    })

    if(!deletedBlogs){
        res.status(404).send({msg: "couldnt find your blog"})
        console.error("blog with the given id not found")
    }
    res.status(200).send("blog succesfully yeeted")        
    } catch (error) {
        console.log(error);
        res.status(404).send({msg: "invalid auth creds"})
    }

})


//get blogs by id (for anyone with the link, or public blogs, etc):
router.get("/:id", async(req, res)=>{
    try {
        const blog= await Blog.findById(req.params.id);
    if(!blog){
        res.status(404).send({msg: "sorry blog not found"})
    }
    res.status(200).json(blog);        
    } catch (error) {
        console.error("invalid blog id");
    }
})



//put blogs by id
router.put("/:id", verifyAuth, async(req, res)=>{
    try {
        const { title, body }= req.body;
        const blogId= req.params.id;
        const updatedBlog = await Blog.findOneAndUpdate(
            {_id: blogId, author_uid: req.user.uid },
            { title, body },
            { new: true }
        ) 

        if(!updatedBlog){res.status(404).send({msg: "sorry the blog doesnt exist"})}
        res.status(200).send({msg: "blog updated succesfully"}, {updatedBlog})
    } catch (error) {
        console.error("sorry blog not found w the given id");
        res.status(404).send({msg: "sorry blog not found w the given id"})        
    }
})



export default router;








