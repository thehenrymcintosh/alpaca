/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript in Alpaca.
 * DO NOT MODIFY IT BY HAND. Instead, modify the Alpaca model and this will regenerate the next time the server starts.
 */

export interface User {
  first_name: string;
  last_name: string;
  email: string;
  company: Company[];
  _id: string;
  updatedAt: {
    [k: string]: any;
  };
  createdAt: {
    [k: string]: any;
  };
}
export interface Company {
  name: string;
  _id: string;
  updatedAt: {
    [k: string]: any;
  };
  createdAt: {
    [k: string]: any;
  };
}
