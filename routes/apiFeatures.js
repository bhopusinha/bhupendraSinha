class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;

        // console.log(this.queryStr);
    }
    
    search() {
        if (this.queryStr.keyword) {
            const keyword = {
                name: {
                    $regex: this.queryStr.keyword,
                    $options: "i"
                }
            };


            this.query = this.query.find({ ...keyword });
        }
        return this;
    }
    
    filter() {
        const queryStr = { ...this.queryStr };

        const removeFields = ["keyword", "limit", "page"];

        removeFields.forEach((key) => {
            delete queryStr[key];
        });

        // for price 
        let changeQuery = JSON.stringify(queryStr);
        changeQuery = changeQuery.replace(/\b(gt|gte|lt|lte)\b/g, key => `$${key}`);
        this.query = this.query.find(JSON.parse(changeQuery));
        return this;
    }

    pagination(resultpage) {
        const numberPage = Number(this.queryStr.page) || 1;
        const skip = resultpage * (numberPage - 1);
        this.query = this.query.limit(resultpage).skip(skip);
        return this;
    }
}

module.exports = ApiFeatures;
