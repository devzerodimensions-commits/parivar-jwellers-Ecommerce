/**
 * Lightweight query-builder helpers for list endpoints:
 * filtering, searching, sorting, field-limiting and pagination.
 *
 * Usage:
 *   const features = new ApiFeatures(Product.find(), req.query)
 *     .search(['name', 'description'])
 *     .filter()
 *     .sort()
 *     .paginate();
 *   const docs = await features.query;
 */
class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this.filters = {};
  }

  // Text search across the given fields (case-insensitive regex).
  search(fields = []) {
    const term = this.queryString.search || this.queryString.q;
    if (term && fields.length) {
      const regex = { $regex: term, $options: 'i' };
      this.filters.$or = fields.map((f) => ({ [f]: regex }));
    }
    return this;
  }

  // Apply equality and range filters from the query string.
  filter() {
    const queryObj = { ...this.queryString };
    ['page', 'sort', 'limit', 'fields', 'search', 'q'].forEach((k) => delete queryObj[k]);

    // Support price[gte], price[lte], rating[gte], etc.
    let str = JSON.stringify(queryObj);
    str = str.replace(/\b(gte|gt|lte|lt|in)\b/g, (m) => `$${m}`);
    const parsed = JSON.parse(str);

    // `in` filters arrive comma-separated.
    Object.keys(parsed).forEach((key) => {
      if (parsed[key] && parsed[key].$in && typeof parsed[key].$in === 'string') {
        parsed[key].$in = parsed[key].$in.split(',');
      }
    });

    Object.assign(this.filters, parsed);
    this.query = this.query.find(this.filters);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    }
    return this;
  }

  paginate() {
    this.page = Math.max(1, parseInt(this.queryString.page, 10) || 1);
    this.limit = Math.min(100, parseInt(this.queryString.limit, 10) || 12);
    const skip = (this.page - 1) * this.limit;
    this.query = this.query.skip(skip).limit(this.limit);
    return this;
  }
}

export default ApiFeatures;
