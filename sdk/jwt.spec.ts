import { FetchJwt, provideFetchJwt } from "./jwt";

describe("JWT methods", () => {
  const mockJWT =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

  describe("fetchJWT", () => {
    let fetchJwt: FetchJwt;
    const mockAxios = {
      post: jest.fn(),
    } as any;

    const resetMocks = () => {
      mockAxios.post.mockReset();
    };

    beforeAll(() => {
      fetchJwt = provideFetchJwt(mockAxios);
    });

    beforeEach(() => resetMocks());

    it("should return a JWT string", async () => {
      mockAxios.post.mockReturnValueOnce({
        data: {
          token: mockJWT,
        },
      });
      const claims = { some: "claim" };
      const expiresAt = new Date();

      const token = await fetchJwt(claims, expiresAt);

      expect(token).toEqual(mockJWT);
      expect(mockAxios.post).toHaveBeenCalledTimes(1);
      expect(mockAxios.post).toHaveBeenCalledWith(
        `http://forta-jwt-provider:8515/create`,
        {
          claims: {
            ...claims,
            exp: Math.floor(expiresAt.getTime() / 1000),
          },
        }
      );
    });
  });
});
