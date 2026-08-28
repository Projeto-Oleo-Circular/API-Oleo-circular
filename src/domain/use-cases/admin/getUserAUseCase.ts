import { IAdminRepository } from "../../repositories/IAdminRepository";

export class GetAlogadoUseCase {
    constructor(
        private readonly adminRepository: IAdminRepository
    ) {}
    async execute(id:number){
        const admin = await this.adminRepository.findById(id);
        if (!admin) {
            throw new Error ('falha ao encontrar dados');
        }
    
     const {
      senhaHash,
      criadoEm,
      atulizadoEm,
      ...userSeguro
    } = admin;

    return {
      ...userSeguro,
      
    };
    }

}

