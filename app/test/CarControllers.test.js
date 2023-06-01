const dayjs = require("dayjs");
const { Car } = require("../models");
const CarController = require("../controllers/CarController");

describe("CarController", () => {
  describe("#handleListCars", () => {
    it("should return status 200 and return json with cars list data", async () => {
      const mockRequest = {
        query: {},
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const mockCarLists = [];

      const mockCar = {
        id: 1,
        name: "mobil test",
        price: 100000,
        size: "large",
        image: "mobil-test.png",
        isCurrentlyRented: false,
        createdAt: "2022-11-17T05:11:01.429Z",
        updatedAt: "2022-11-17T05:11:01.429Z",
        userCar: null,
      };

      mockCarLists.push(mockCar);

      const mockCarModel = {
        findAll: jest.fn().mockReturnValue(mockCarLists),
        count: jest.fn().mockReturnValue(10),
      };

      const carController = new CarController({
        carModel: mockCarModel,
        userCarModel: {},
      });
      await carController.handleListCars(mockRequest, mockResponse);

      const expectedPagination = carController.buildPaginationObject(
        mockRequest,
        10
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        cars: mockCarLists,
        meta: {
          pagination: expectedPagination,
        },
      });
    });
  });

  describe("#handleGetCar", () => {
    it("should return status 200 and return json with car data", async () => {
      const name = "mobil test";
      const price = 100000;
      const size = "large";
      const image = "gambar-test.png";
      const isCurrentlyRented = false;

      const mockRequest = {
        params: {
          id: 1,
        },
      };

      const mockCar = new Car({ name, price, size, image, isCurrentlyRented });
      const mockCarModel = {
        findByPk: jest.fn().mockReturnValue(mockCar),
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const carController = new CarController({ carModel: mockCarModel });

      await carController.handleGetCar(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCar);
    });
  });

  describe("#handleCreateCar", () => {
    it("should return status 201 and return json with car data", async () => {
      const name = "mobil test";
      const price = 100000;
      const size = "large";
      const image = "gambar-test.png";
      const isCurrentlyRented = false;

      const mockRequest = {
        body: {
          name,
          price,
          size,
          image,
          isCurrentlyRented,
        },
      };

      const car = new Car({ name, price, size, image, isCurrentlyRented });
      const mockCarModel = {
        create: jest.fn().mockReturnValue(car),
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const carController = new CarController({ carModel: mockCarModel });
      await carController.handleCreateCar(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(car);
    });

    it("should return status 422 and return json with error details", async () => {
      const err = new Error("Something");
      const name = "mobil test";
      const price = 100000;
      const size = "large";
      const image = "gambar-test.png";
      const isCurrentlyRented = false;

      const mockRequest = {
        body: {
          name,
          price,
          size,
          image,
          isCurrentlyRented,
        },
      };

      const mockCarModel = {
        create: jest.fn().mockReturnValue(Promise.reject(err)),
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const carController = new CarController({ carModel: mockCarModel });
      await carController.handleCreateCar(mockRequest, mockResponse);

      expect(mockCarModel.create).toHaveBeenCalledWith({
        name,
        price,
        size,
        image,
        isCurrentlyRented,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          name: err.name,
          message: err.message,
        },
      });
    });
  });

  describe("#handleRentCar", () => {
    it("should return return status 201 and return json with user car instance", async () => {
      const rentStartedAt = new Date().toString();
      const rentEndedAt = dayjs(rentStartedAt).add(1, "day");

      const mockRequest = {
        body: {
          rentStartedAt,
          rentEndedAt: null,
        },
        params: {
          id: 1,
        },
        user: {
          id: 1,
        },
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const mockNext = jest.fn();

      const mockCar = {
        id: 1,
        name: "mobil test",
        price: 100000,
        size: "large",
        image: "gambar-test.png",
        isCurrentlyRented: false,
        createdAt: "2023-05-27T05:11:01.429Z",
        updatedAt: "2023-05-27T05:11:01.429Z",
        userCar: null,
      };

      const mockCarModel = {
        findByPk: jest.fn().mockReturnValue(mockCar),
      };

      const mockUserCar = {
        id: 1,
        userId: 1,
        carId: 1,
        rentStartedAt: null,
        rentEndedAt: null,
        createdAt: null,
        updatedAt: null,
      };

      const mockUserCarModel = {
        findOne: jest.fn().mockReturnValue(null),
        create: jest.fn().mockReturnValue({
          ...mockUserCar,
          rentStartedAt,
          rentEndedAt,
        }),
      };

      const carController = new CarController({
        carModel: mockCarModel,
        userCarModel: mockUserCarModel,
        dayjs,
      });
      await carController.handleRentCar(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        ...mockUserCar,
        rentStartedAt,
        rentEndedAt,
      });
    });

    it("should call next function", async () => {
      const rentStartedAt = new Date().toString();

      const mockRequest = {
        body: {
          rentStartedAt,
          rentEndedAt: null,
        },
        params: {
          id: 1,
        },
        user: {
          id: 1,
        },
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const mockNext = jest.fn();

      const mockCarModel = {
        findByPk: jest.fn().mockRejectedValue(new Error()),
      };

      mockUserCarModel = {};

      const carController = new CarController({
        carModel: mockCarModel,
        userCarModel: mockUserCarModel,
        dayjs,
      });

      await carController.handleRentCar(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("#handleUpdateCar", () => {
    it("should return status 201 and return json with car data", async () => {
      const name = "mobil test";
      const price = 100000;
      const size = "large";
      const image = "gambar-test.png";
      const isCurrentlyRented = false;

      const mockrequest = {
        params: {
          id: 1,
        },
        body: {
          name,
          price,
          size,
          image,
          isCurrentlyRented,
        },
      };

      const mockCar = new Car({ name, price, size, image, isCurrentlyRented });
      mockCar.update = jest.fn().mockReturnThis();

      const mockCarModel = {
        findByPk: jest.fn().mockReturnValue(mockCar),
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const carController = new CarController({ carModel: mockCarModel });
      await carController.handleUpdateCar(mockrequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCar);
    });
  });

  describe("#handleDeleteCar", () => {
    it("should return status 204", async () => {
      const name = "mobil test";
      const price = 100000;
      const size = "large";
      const image = "gambar-test.png";
      const isCurrentlyRented = false;

      const mockRequest = {
        params: {
          id: 1,
        },
      };

      const mockCar = new Car({ name, price, size, image, isCurrentlyRented });

      const mockCarModel = {
        findByPk: jest.fn().mockReturnValue(mockCar),
        destroy: jest.fn(),
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        end: jest.fn().mockReturnThis(),
      };

      const carController = new CarController({ carModel: mockCarModel });
      await carController.handleDeleteCar(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.end).toHaveBeenCalled();
    });
  });

  describe("#getCarFromRequest", () => {
    it("should return car", () => {
      const mockRequest = {
        params: {
          id: 1,
        },
      };

      const mockCar = 1;

      const mockCarModel = {
        findByPk: jest.fn().mockReturnValue(mockCar),
      };

      const carController = new CarController({ carModel: mockCarModel });
      const car = carController.getCarFromRequest(mockRequest);

      expect(car).toEqual(1);
    });
  });
});
 