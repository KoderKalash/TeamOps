/*⚠️ Important:
-> APIFeatures must never know about roles or users
-> It only modifies the query it receives
*/

class APIFeatures {
    constructor(query, queryString) {
        this.query = query
        this.queryString = queryString
    }

    filter() {
        const queryObj = { ...this.queryString }

        const excludedFields = ["page", "sort", "search", "limit"]
        excludedFields.forEach(field => delete queryObj[field])

        let mongoFilter = {}
        Object.keys(queryObj).forEach(key => {
            if (key.includes("[")) {
                const field = queryObj.split("[")[0]
                const op = queryObj.split("[")[1].replace("]", "")

                if (!mongoFilter[field])
                    mongoFilter[field] = {}

                const val = isNaN(queryObj[key]) ? queryObj[key] : Number(queryObj[key])
                mongoFilter[field][`$${op}`] = val

            } else mongoFilter[field] = queryObj[key]
        })
        console.log(mongoFilter)

        this.query = this.query.find(mongoFilter)
        return this
    }

    search() {
        if (!this.queryString.search) return this

        //index search
        if (process.env.SEARCH_STRATEGY === "text")
            this.query = this.query.find({
                $text: { $search: this.queryString.search }
            })

        //Regular Expression(regex)
        this.query = this.query.find({
            $or: [
                { name: { $regex: searchQuery, $options: "i" } },
                { description: { $regex: searchQuery, $options: "i" } }
            ]
        })

    }

    sort(){
        if(this.queryString.sort){
            const sortQuery = this.queryString.sort.split(",").join(" ")
            this.query = this.query.sort(sortQuery)
        }else{
            this.query.sort("-createdAt")
        }

        return this
    }

    paginate() {
        const page = Number(this.queryString.page) || 1
        const limit = Number(this.queryString.limit) || 10
        const skip = (page - 1) * limit

        this.query = this.query.skip(skip).limit(limit)
        return this
    }
}