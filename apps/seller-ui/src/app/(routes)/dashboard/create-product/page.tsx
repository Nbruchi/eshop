import ColorPicker from 'apps/seller-ui/src/shared/components/color-picker';
import ImagePlaceholder from 'apps/seller-ui/src/shared/components/image-placeholder';
import Input from 'apps/seller-ui/src/shared/components/input';
import { ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

const CreateProduct = () => {
  const [openImageModal, setOpenImageModal] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [images, setImages] = useState<(File | null)[]>([null]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleImageChange = (file: File | null, index: number) => {
    const updatedImages = [...images];
    updatedImages[index] = file;

    if (index == images.length - 1 && images.length < 8) {
      updatedImages.push(null);
    }
    setImages(updatedImages);
    setValue('images', updatedImages);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => {
      let updatedImages = [...prevImages];

      if (index === -1) {
        updatedImages[0] = null;
      } else {
        updatedImages.splice(index, 1);
      }

      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }
      return updatedImages;
    });
    setValue(`images`, images);
  };

  const onSubmit = (data: any) => {
    console.log(data);
  };
  return (
    <form
      className="w-full mx-auto p-8 shadow-md rounded-lg text-white"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h2 className="text-2xl py-2 font-semibold font-Poppins text-white">
        Create Product
      </h2>
      {/* Breadcrumb */}
      <div className="flex items-center">
        <span className="text-[#80deea] cursor-pointer">Dashboard</span>
        <ChevronRight size={20} className="opacity-[0.98]" />
        <span>Create Product</span>
      </div>
      {/* Content Layout */}
      <div className="py-4 w-full flex gap-6">
        {/* Left side - Image upload */}
        <div className="md:w-[35%]">
          {images.length > 8 && (
            <ImagePlaceholder
              setOpenImageModal={setOpenImageModal}
              size="765 x 850"
              small={false}
              index={0}
              onRemove={handleRemoveImage}
              onImageChange={handleImageChange}
            />
          )}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {images.slice(1).map((_, index) => (
              <ImagePlaceholder
                setOpenImageModal={setOpenImageModal}
                size="765 x 850"
                small
                key={index}
                index={index + 1}
                onRemove={handleRemoveImage}
                onImageChange={handleImageChange}
              />
            ))}
          </div>
        </div>
        <div className="md:w-[65%]">
          <div className="w-full flex gap-6">
            {/* Product Title input */}
            <div className="w-2/4">
              <Input
                title="Product Title *"
                placeholder="Enter product title"
                {...register('title', {
                  required: `Title is required`,
                })}
              />
              {errors.title && (
                <p className="text-error">{String(errors.title.message)}</p>
              )}
              <div className="mt-2">
                <Input
                  type="textarea"
                  rows={7}
                  cols={10}
                  label="Short Description * (Max 150 words)"
                  placeholder="Enter product description for quick view"
                  {...register('description', {
                    required: `Description is required`,
                    validate: (value) => {
                      const wordCount = value.trim().split(/\s+/).length;
                      return (
                        wordCount <= 150 ||
                        `Description cannot exceed 150 words (Current: ${wordCount})`
                      );
                    },
                  })}
                />
                {errors.description && (
                  <p className="text-error">
                    {String(errors.description.message)}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <Input
                  type="text"
                  label="Tags *"
                  placeholder="apple,flagship,.."
                  {...register('tags', {
                    required: `Separate related tags with a comma`,
                  })}
                />
                {errors.tags && (
                  <p className="text-error">{String(errors.tags.message)}</p>
                )}
              </div>
              <div className="mt-2">
                <Input
                  type="text"
                  label="Warranty *"
                  placeholder="1 Year/ No warranty"
                  {...register('warranty', {
                    required: `Warranty is required`,
                  })}
                />
                {errors.warranty && (
                  <p className="text-error">
                    {String(errors.warranty.message)}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <Input
                  label="Slug *"
                  placeholder="product-slug"
                  {...register('slug', {
                    required: `Slug is required`,
                    pattern: {
                      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                      message: `Invalid slug format! Use only lower case letters or numbers`,
                    },
                    minLength: {
                      value: 3,
                      message: `Slug must be at least 3 characters long`,
                    },
                    maxLength: {
                      value: 50,
                      message: `Slug cannot go beyond 50 characters`,
                    },
                  })}
                />
                {errors.slug && (
                  <p className="text-error">{String(errors.slug.message)}</p>
                )}
              </div>
              <div className="mt-2">
                <Input
                  type="text"
                  label="Brand *"
                  placeholder="Apple"
                  {...register('brand')}
                />
                {errors.brand && (
                  <p className="text-error">{String(errors.brand.message)}</p>
                )}
              </div>
              <div className="mt-2">
                <ColorPicker />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreateProduct;
