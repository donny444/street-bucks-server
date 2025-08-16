import { Test, TestingModule } from '@nestjs/testing';
import { StaffsController } from '../controllers/staffs.controller';
import { AppService } from '../app.service';
import StaffDataDto from '../dtos/staff_data.dto';

describe('StaffsController', () => {
  let controller: StaffsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffsController],
      providers: [
        {
          provide: AppService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<StaffsController>(StaffsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('RegisterStaff should return success message', () => {
    const staffData: StaffDataDto = { firstName: 'John', lastName: 'Doe', password: 'pass' } as any;
    const res = { json: jest.fn() } as any;
    controller.RegisterStaff(staffData, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Staff registered successfully.' });
  });

  it('RegisterStaff should return 400 if missing fields', () => {
    const staffData: StaffDataDto = { firstName: '', lastName: '', password: '' } as any;
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() } as any;
    controller.RegisterStaff(staffData, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'First name, last name, and password are required.' });
  });

  it('CheckInStaff should return check status message', () => {
    const params = { id: '1' };
    const res = { json: jest.fn() } as any;
    controller.CheckInStaff(params, true, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Staff: 1 check status: true' });
  });

  it('GetStaffInfo should return staff info message', () => {
    const params = { id: '1' };
    const res = { json: jest.fn() } as any;
    controller.GetStaffInfo(params, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'See the specific information of staff: 1' });
  });

  it('EditStaffInfo should return manipulate info message', () => {
    const staffData: StaffDataDto = { firstName: 'Jane', lastName: 'Smith', password: 'pass2' } as any;
    const res = { json: jest.fn() } as any;
    controller.EditStaffInfo('2', staffData, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Manipulate the information of staff: 2' });
  });

  it('DeleteAStaff should return delete message', () => {
    const params = { id: '3' };
    const res = { json: jest.fn() } as any;
    controller.DeleteAStaff(params, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Delete all information of staff: 3' });
  });
});
