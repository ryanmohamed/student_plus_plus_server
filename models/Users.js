const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {

    const Users = sequelize.define("Users", {
        //define each field or column
        username: {
            primaryKey: true,
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        }
        /* WE NO LONGER NEED THIS */
        // uuid: {
        //     primaryKey: true,
        //     type: DataTypes.UUID,
        //     defaultValue: function() {
        //         return uuidv4();
        //     }
        // }
    });
    
    //The A.hasMany(B) association means that a One-To-Many relationship exists between A and B,
    // with the foreign key being defined in the target model (B).
    //models has access to all
    Users.associate = (models) => {
        Users.hasMany(models.Courses, {
            onDelete: "cascade" //on a user delete, all assignments will also be deleted
        });
    };

    return Users;

}
