// Extend the DefaultNamingStrategy
declare module "typeorm" {
  interface DefaultNamingStrategy {
    eagerJoinRelationAlias(alias: string, propertyPath: string): string;
  }
}

// Import DefaultNamingStrategy from TypeORM
import { DefaultNamingStrategy } from "typeorm";

// Override the eagerJoinRelationAlias method
DefaultNamingStrategy.prototype.eagerJoinRelationAlias = function (
  alias: string,
  propertyPath: string
): string {
  const path = propertyPath
    .split(".")
    .map((p) => p.substring(0, 2))
    .join("_");
  const out = alias + "_" + path;
  const match = out.match(/_/g) || [];
  return out + match.length;
};
