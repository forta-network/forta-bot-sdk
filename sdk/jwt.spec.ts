import { FetchJwt, provideFetchJwt, MOCK_JWT } from "./jwt";

describe("JWT methods", () => {
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

    it("should return a JWT string from scan node when in production mode", async () => {
      process.env.NODE_ENV = "production";
      const jwt = "someJwt";
      mockAxios.post.mockReturnValueOnce({
        data: {
          token: jwt,
        },
      });
      const claims = { some: "claim" };
      const expiresAt = new Date();

      const token = await fetchJwt(claims, expiresAt);

      expect(token).toEqual(jwt);
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

    it("should return a mock JWT when not in production mode", async () => {
      process.env.NODE_ENV = "development";

      const token = await fetchJwt({});

      expect(token).toEqual(MOCK_JWT);
      expect(mockAxios.post).toHaveBeenCalledTimes(0);
    });
  });
});
