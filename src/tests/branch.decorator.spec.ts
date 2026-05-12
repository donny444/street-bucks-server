import { ExecutionContext, UnauthorizedException } from "@nestjs/common";

jest.mock("@nestjs/common", () => {
  const actual = jest.requireActual("@nestjs/common");
  return {
    ...actual,
    createParamDecorator: jest.fn((factory: unknown) => ({ factory })),
  };
});

import { BranchPayload } from "../decorators/branch.decorator";

describe("BranchPayload decorator", () => {
  const factory = (BranchPayload as unknown as { factory: Function }).factory;

  const createContext = (branchPayload?: { branchId: number }) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ branchPayload }),
      }),
    }) as ExecutionContext;

  it("should return branch payload when present", () => {
    const payload = { branchId: 9 };
    expect(factory(undefined, createContext(payload))).toEqual(payload);
  });

  it("should throw UnauthorizedException when missing", () => {
    expect(() => factory(undefined, createContext())).toThrow(
      UnauthorizedException,
    );
    expect(() => factory(undefined, createContext())).toThrow(
      "Branch authorization required. Ensure branch-token header is provided.",
    );
  });
});
