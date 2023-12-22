import { Document } from "mongoose";

interface DeleteAtPathOptions {
  obj: any;
  path: string[];
  index: number;
}

const deleteAtPath = ({ obj, path, index }: DeleteAtPathOptions) => {
  if (index === path.length - 1) {
    delete obj[path[index]];
    return;
  }
  deleteAtPath({ obj: obj[path[index]], path, index: index + 1 });
};

export const toJSON = (schema: any) => {
  let transform: ((doc: Document, ret: any, options: any) => any) | undefined;

  if (schema.options.toJSON && schema.options.toJSON.transform) {
    transform = schema.options.toJSON.transform;
  }

  schema.options.toJSON = Object.assign(schema.options.toJSON || {}, {
    transform(doc: Document, ret: any, options: any) {
      Object.keys(schema.paths).forEach((path) => {
        if (schema.paths[path].options && schema.paths[path].options.private) {
          deleteAtPath({ obj: ret, path: path.split("."), index: 0 });
        }
      });

      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      // delete ret.createdAt;
      // delete ret.updatedAt;
      delete ret.isDeleted;

      if (transform) {
        return transform(doc, ret, options);
      }
    },
  });
};

export default toJSON;
