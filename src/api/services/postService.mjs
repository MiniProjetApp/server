import Post from "../models/postModel.mjs"
import PostLanguages from "../models/postLanguagesModel.mjs"
import AdvancedCriteria from "../models/advancedCriteriasModel.mjs"
import { advancedInfoService } from "./advancedInfoService.mjs"
import { Op, where } from "sequelize";
import { SubscriptionService } from "./subscriptionService.mjs";
import { userService } from "./userService.mjs";

export class PostService{
    static async findAll(){
      try {
        const posts = await Post.findAll();
        
        const postsWithData = await Promise.all(posts.map(async (post) => {
          const postLanguages = await PostLanguages.findAll({
            where: {
              postID: post.postID,
            },
          });
          const languages = postLanguages.map(language => ({
            languageID: language.languageID,
            level: language.level
          }));
    
          const postCriterias = await AdvancedCriteria.findAll({
            where: {
              postID: post.postID,
            },
          });
          const criterias = postCriterias.map(criteria => criteria.criteriaID);
          const postMaker = await userService.getEntrepriseInfo(post.userID);
          if (postMaker){
          console.log(postMaker.name)
          post.dataValues.entreprise = postMaker.name;
          post.dataValues.picture = postMaker.logo;
          console.log("post: ")
          console.log(post)
          }          
          
          let finalobject = {...post.toJSON(),
            languages: languages,
            criterias: criterias
          }
          if (criterias.length===0){
            delete finalobject['criterias']
          }
          if (languages.length===0){
            delete finalobject['languages']
          }
          console.log("got here")
          console.log(finalobject)
          return (finalobject);
        }));
        console.log("final data:");
        console.log(postsWithData);
        return(postsWithData) 
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    }
    static async create(postData,languages,criterias) {
        try {
          const canPost = await SubscriptionService.canPost(postData.userID);
            if (!canPost.canPost) {
              throw new Error(canPost.message);
            }
          const post = await Post.create(postData);
          post.save()
          if (criterias){
            console.log("there are criterias!!!")
            const createdCriteria = await advancedInfoService.addAdvancedCriteria(post.postID,criterias)
          }
          if (languages){
            const createdLanguages = await advancedInfoService.addPostLanguages(post.postID,languages)
          }
          return post;
        } catch (error) {
          throw error;
        }
      }
    static async getPostInfo(postID){
      try{
        const post = await Post.findByPk(postID);
        if (!post){
          const notFoundError = new Error("Post doesn't exist");
          notFoundError.status = 404;
          throw notFoundError;
        }else{
          const postLanguages = await PostLanguages.findAll({
            where: {
                postID: postID
            }
          });
          const postCriteria = await AdvancedCriteria.findAll({
            where:{
              postID:postID
            }
          })
          const languages = postLanguages.map(language => ({
            languageID: language.languageID,
            level: language.level
          }));

          const postMaker =  await userService.getEntrepriseInfo(post.userID)
          post.dataValues.entreprise = postMaker.name
          post.dataValues.picture = postMaker.logo
          console.log(post)

          const criterias = postCriteria.map(criteria => criteria.criteriaID);
          console.log(criterias)
          console.log(languages)
          let finalobject = {...post.toJSON(),
            languages: languages,
            criterias: criterias
            }
            if (criterias.length===0){
              delete finalobject['criterias']
            }
            if (languages.length===0){
              delete finalobject['languages']
            }
            return (finalobject);
          }
      }catch(error){
        throw error;
      }
      }
    static async searchPosts(params) {
      try {
        console.log("params")
         const whereClause = {};
      
        if (params && typeof params === "object") {
          console.log(params)
          if (params.title) {
            whereClause.title = { [Op.like]: `%${params.title}%` };
          }
          if (params.fieldID) {
            whereClause.fieldID = params.fieldID;
          }
          if (params.wilaya) {
            whereClause.wilaya = { [Op.like]: `%${params.wilaya}%` };            }
          }
          if (params.subfieldID) {
            whereClause.subfieldID = params.subfieldID;
          }
          if (params.experience_required) {
            console.log("there is experience")
            whereClause[Op.or] = whereClause[Op.or] || [];
            whereClause[Op.or].push({ experience_required: { [Op.lte]: params.experience_required } }, { experience_required: null });
          }
          if (params.study_level) {
            whereClause[Op.or] = whereClause[Op.or] || [];
            whereClause[Op.or].push({ study_level: { [Op.lte]: params.study_level } }, { study_level: null });
          }
      
          console.log("where clause: ");
          console.log(whereClause);
      
          const posts = await Post.findAll({
            where: whereClause,
          });

          const postsWithData = await Promise.all(posts.map(async (post) => {
            const postLanguages = await PostLanguages.findAll({
              where: {
                postID: post.postID,
              },
            });
            const languages = postLanguages.map(language => ({
              languageID: language.languageID,
              level: language.level
            }));
      
            const postCriterias = await AdvancedCriteria.findAll({
              where: {
                postID: post.postID,
              },
            });
            const criterias = postCriterias.map(criteria => criteria.criteriaID);
            const postMaker =  await userService.getEntrepriseInfo(post.userID)
            console.log(post.userID)
            post.dataValues.entreprise = postMaker.name
            post.dataValues.picture = postMaker.logo
              
            let finalobject = {...post.toJSON(),
              languages: languages,
              criterias: criterias
            }
            if (criterias.length===0){
              delete finalobject['criterias']
            }
            if (languages.length===0){
              delete finalobject['languages']
            }
            return (finalobject);
          }));
      
          return postsWithData;
        } catch (error) {
          console.error("Error searching posts:", error);
          throw error;
        }
      }
      static async deletePostByID(postID) {
        try {
            const post = await Post.findByPk(postID);

            if (!post) {
                const notFoundError = new Error("Post not found");
                notFoundError.status = 404;
                throw notFoundError;
            }

            await PostLanguages.destroy({
                where: {
                    postID: postID
                }
            });

            await AdvancedCriteria.destroy({
                where: {
                    postID: postID
                }
            });

            await post.destroy();

            return { message: "Post deleted successfully" };
        } catch (error) {
            throw error;
        }
    }
}
