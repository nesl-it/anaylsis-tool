import { Document, Model, FilterQuery } from "mongoose";

interface PaginateOptions {
  sortBy?: string;
  populate?: string;
  limit?: number;
  page?: number;
}

interface QueryResult<T> {
  data: T[];
  page: number;
  limit: number;
  hasNext: boolean;
  totalPages: number;
}

export const paginate = <T extends Document>(schema: any) => {
  schema.statics.paginate = async function (
    filter: FilterQuery<T> = {},
    options: PaginateOptions = {}
  ): Promise<QueryResult<T>> {
    let sort = "";

    if (options.sortBy) {
      const sortingCriteria: string[] = [];

      options.sortBy.split(",").forEach((sortOption) => {
        const [key, order] = sortOption.split(":");
        sortingCriteria.push((order === "desc" ? "-" : "") + key);
      });

      sort = sortingCriteria.join(" ");
    } else {
      sort = "createdAt"; // Default sorting criteria
    }

    const limit =
      options.limit && parseInt(options.limit.toString(), 10) > 0 ? parseInt(options.limit.toString(), 10) : 10;
    const page = options.page && parseInt(options.page.toString(), 10) > 0 ? parseInt(options.page.toString(), 10) : 1;
    const skip = (page - 1) * limit;

    const countPromise = this.countDocuments(filter).exec();
    let docsPromise = this.find(filter).sort(sort).skip(skip).limit(limit);

    if (options.populate) {
      options.populate.split(",").forEach((populateOption) => {
        const populateObj: any = {};
        populateOption
          .split(".")
          .reverse()
          .forEach((pathPart) => {
            populateObj.path = pathPart;
            if (populateObj.populate) {
              populateObj.populate = { ...populateObj.populate };
            } else {
              populateObj.populate = "";
            }
          });
        docsPromise = docsPromise.populate(populateObj);
      });
    }

    docsPromise = docsPromise.exec();

    return Promise.all([countPromise, docsPromise]).then((values) => {
      const [totalResults, results] = values;
      const totalPages = Math.ceil(totalResults / limit);
      const result: QueryResult<T> = {
        data: results,
        page,
        limit,
        hasNext: page < totalPages,
        totalPages: totalResults,
      };

      return Promise.resolve(result);
    });
  };
};
