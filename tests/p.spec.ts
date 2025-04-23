import { describe, test, expect } from "vitest";
import { suma } from "../src/p";

describe("PAra poder funciona coveralls", ()=> {
  test ("2+1=3", () => {
    expect(suma(2,1)).toBe(3);
  })
});