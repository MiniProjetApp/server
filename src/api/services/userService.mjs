import User from "../models/userModel.mjs";
import { Op, where } from "sequelize";
import candidateProfile from "../models/candidateProfileModel.mjs";
import ProfileEntreprise from "../models/entrepriseProfileModel.js";
import EnterpriseProfile from "../models/entrepriseProfileModel.js";

export class userService {
  static async getCandidateInfo(userTargetID) {
    try {
      const userData = await candidateProfile.findByPk(userTargetID);
      console.log(userTargetID);
      if (!userData) {
        const notFoundError = new Error("User doesn't exist");
        notFoundError.status = 404;
        throw notFoundError;
      } else {
        return userData.dataValues;
      }
    } catch (error) {
      throw error;
    }
  }
  static async getEntrepriseInfo(userTargetID) {
    try {
      console.log("gg");
      const userData = await EnterpriseProfile.findByPk(userTargetID);
      if (!userData) {
        const notFoundError = new Error("User doesn't exist");
        notFoundError.status = 404;
        throw notFoundError;
      } else {
        return userData.dataValues;
      }
    } catch (error) {
      throw error;
    }
  }
  static async searchCandidates(params) {
    try {
      const whereClause = {};

      if (params && typeof params === "object") {
        if (params.name) {
          whereClause[Op.or] = [
            { first_name: { [Op.like]: `%${params.name}%` } },
            { last_name: { [Op.like]: `%${params.name}%` } },
            {
              [Op.and]: [
                { first_name: { [Op.like]: `%${params.name.split(" ")[0]}%` } },
                { last_name: { [Op.like]: `%${params.name.split(" ")[1]}%` } },
              ],
            },
          ];
        }
        if (params.fieldID) {
          whereClause.fieldID = params.fieldID;
        }
        if (params.is_verified !== undefined && params.is_verified == "true") {
          whereClause.is_verified = 1;
        }
      }
      console.log("where clause: ");
      console.log(whereClause);
      const candidateProfiles = await candidateProfile.findAll({
        where: whereClause,
      });
      return candidateProfiles;
    } catch (error) {
      console.error("Error searching candidate profiles:", error);
      throw error;
    }
  }
  static async searchEntreprise(params) {
    try {
      const whereClause = {};
      if (params && typeof params === "object") {
        if (params.name) {
          whereClause.name = { [Op.like]: `%${params.name}%` };
        }
        if (params.fieldID) {
          whereClause.fieldID = params.fieldID;
        }
        if (params.headquarter_state) {
          whereClause.headquarter_state = params.headquarter_state;
        }
      }

      const entrepriseProfiles = await EnterpriseProfile.findAll({
        where: whereClause,
      });
      return entrepriseProfiles;
    } catch (error) {
      console.error("Error searching entreprise profiles:", error);
      throw error;
    }
  }
}
