import {DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.mjs';

const Field = sequelize.define('Field', {
    fieldID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  }, {
    tableName: 'field',
    timestamps: false, 
    charset: 'utf8mb4',
    collate: 'utf8mb4_0900_ai_ci',
  });

  (async () => {
    try {
      await Field.sync({ force: false });
      console.log('Field model synced with database');
    } catch (error) {
      console.error('Error syncing User model:', error);
    }
  })();
  
  export default Field;