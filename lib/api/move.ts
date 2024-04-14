import { throwExpression } from "../shared/utils";

export const MOVE_PACKAGE_ID =
  process.env.MOVE_PACKAGE_ID ??
  throwExpression(new Error("EXAMPLE_MOVE_PACKAGE_ID not configured"));

  export const MOVE_OBJECT_ID =
  process.env.MOVE_OBJECT_ID ??
  throwExpression(new Error("EXAMPLE_MOVE_PACKAGE_ID not configured"));
