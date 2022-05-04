module.exports = (sequelize, DataTypes) => {

    const Tokens = sequelize.define("Tokens", {
        //define each field or column
        refreshToken: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    });

    return Tokens;

}
