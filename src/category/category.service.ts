import { Location } from './../locations/entities/location.entity';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { Category } from "./entities/category.entity";

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>
  ) {}

  // CREATE - XATO TUZATILDI
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { parent_id,name} = createCategoryDto;
    const categoriesName = await this.categoryRepository.findOne({where:{name}})
    if (categoriesName) {
      throw new BadRequestException({ message: `Bunday Categort ${name} mavjud` });
    } 
    if (parent_id) {     
      const parentCategory = await this.categoryRepository.findOne({
        where: { id: parent_id }, // parent_id emas, id bo'lishi kerak
      });
      if (!parentCategory) {
        throw new BadRequestException({
          message: `Parent category with ID ${parent_id} not found`,
        });
      }
    }
    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  // READ ALL (barcha kategoriyalar)
  async findAll(): Promise<Category[]> {
    return await this.categoryRepository.find({
      relations: ["children", "parent", "location"],
    });
  }

  // Parent Categorylarni null yani Asosiy Categorylarni chiqarib olish
  async findParentCategories(): Promise<Category[]> {
    return await this.categoryRepository.find({
      where: { parent_id: IsNull() },
      relations: ["children"],
    });
  }

  // READ CHILDREN BY PARENT ID
  async findChildrenByParentId(parentId: number): Promise<Category[]> {
    const parentExists = await this.categoryRepository.findOne({
      where: { id: parentId },
    });

    if (!parentExists) {
      throw new NotFoundException(
        `Parent category with ID ${parentId} not found`
      );
    }

    return await this.categoryRepository.find({
      where: { parent_id: parentId },
      relations: ["children"],
    });
  }

  // READ ONE
  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id: id },
      relations: ["children", "parent", "location"],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  // KATEGORIYA MAHSULOTLARINI OLISH - YANGI METOD
  async getCategoryProducts(categoryId: number) {
    const category = await this.findOne(categoryId);

    return await this.categoryRepository.findOne({
      where: { id: categoryId },
      relations: ["location"], // products relation qo'shilishi kerak
    });
  }

  // UPDATE
  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto
  ): Promise<Category> {
    const category = await this.findOne(id);

    // Parent_id tekshiruvi
    if (updateCategoryDto.parent_id !== undefined) {
      // Agar parent_id null qilinayotgan bo'lsa
      if (updateCategoryDto.parent_id === null) {
        // OK - bu parent kategoriya bo'ladi
      } else {
        // Agar o'zini parent qilmoqchi bo'lsa
        if (updateCategoryDto.parent_id === id) {
          throw new BadRequestException("Category cannot be its own parent");
        }

        // Parent kategoriya mavjudligini tekshirish
        const parentCategory = await this.categoryRepository.findOne({
          where: { id: updateCategoryDto.parent_id },
        });

        if (!parentCategory) {
          throw new NotFoundException(
            `Parent category with ID ${updateCategoryDto.parent_id} not found`
          );
        }

        // Circular reference tekshiruvi
        await this.checkCircularReference(id, updateCategoryDto.parent_id);
      }
    }

    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  // DELETE
  async remove(id: number): Promise<{ message: string; status: number }> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ["children"],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Agar bu kategoriyaning bolalari bo'lsa
    if (category.children && category.children.length > 0) {
      // Bolalarni parent kategoriyaga ko'chirish
      for (const child of category.children) {
        child.parent_id = category.parent_id; // Null bo'lishi mumkin
        await this.categoryRepository.save(child);
      }
    }

    await this.categoryRepository.remove(category);
    return {
      message: `Category deleted successfully`,
      status: 200,
    };
  }

  // Circular reference tekshirish uchun yordamchi metod
  private async checkCircularReference(
    categoryId: number,
    newParentId: number
  ): Promise<void> {
    const checkParent = async (parentId: number): Promise<boolean> => {
      if (parentId === categoryId) {
        return true; // Circular reference topildi
      }

      const parent = await this.categoryRepository.findOne({
        where: { id: parentId },
      });

      if (parent && parent.parent_id) {
        return await checkParent(parent.parent_id);
      }

      return false;
    };

    const hasCircular = await checkParent(newParentId);
    if (hasCircular) {
      throw new BadRequestException(
        "Circular reference detected - this would create an infinite loop"
      );
    }
  }
}
