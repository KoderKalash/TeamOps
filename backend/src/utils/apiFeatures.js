/*⚠️ Important:
-> APIFeatures must never know about roles or users
-> It only modifies the query it receives
*/

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };

    const excludedFields = ["page", "sort", "search", "limit"];
    excludedFields.forEach((el) => delete queryObj[el]);

    const mongoFilter = {};

    Object.keys(queryObj).forEach((key) => {
      // handles createdAt[gte]
      if (key.includes("[")) {
        const field = key.split("[")[0];
        const op = key.split("[")[1].replace("]", "");

        if (!mongoFilter[field]) mongoFilter[field] = {};

        let value = queryObj[key];

        if (!isNaN(value)) value = Number(value);
        else if (!isNaN(Date.parse(value))) value = new Date(value);

        mongoFilter[field][`$${op}`] = value;
      }
      // handles status=done, priority=high
      else {
        mongoFilter[key] = queryObj[key];
      }
    });

    this.query = this.query.find(mongoFilter);
    return this;
  }

  search(field = []) {
    if (!this.queryString.search || field.length === 0) return this;

    const regex = {
      $or: field.map(field => ({
        [field]: { $regex: this.queryString.search, $options: "i" }
      }))
    }

    this.query = this.query.find(regex);

    /*
    if (process.env.SEARCH_STRATEGY === "text") {
      this.query = this.query.find({
        $text: { $search: this.queryString.search },
      });
    } else {
      
    }*/

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortQuery = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortQuery);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

export default APIFeatures;
