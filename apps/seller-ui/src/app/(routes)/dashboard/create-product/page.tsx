'use client';

import { useQuery } from '@tanstack/react-query';
import ColorPicker from 'apps/seller-ui/src/shared/components/ColorPicker';
import CustomProperties from 'apps/seller-ui/src/shared/components/CustomProperties';
import CustomSpecifications from 'apps/seller-ui/src/shared/components/CustomSpecifications';
import ImagePlaceholder from 'apps/seller-ui/src/shared/image-placeholder';
import Input from 'apps/seller-ui/src/shared/input';
import RichTextEditor from 'apps/seller-ui/src/shared/components/RichTextEditor';
import SizeSelector from 'apps/seller-ui/src/shared/components/SizeSelector';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { aiEnhancements } from 'apps/seller-ui/src/utils/constants';
import { ChevronRight, LoaderCircle, Wand, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Breadcrumb from 'apps/seller-ui/src/shared/components/Breadcrumb';

type FormData = {
  discountCodes: string[];
  title: string;
  description: string;
  tags: string;
  warranty: string;
  slug: string;
  brand: string;
  cashOnDelivery: string;
  category: string;
  subcategory: string;
  detailedDescription: string;
  videoUrl: string;
  regularPrice: number;
  salePrice: number;
  stock: number;
  images: (UploadedImage | null)[];
  colors: string[];
  specifications: string[];
  properties: string[];
  sizes: string[];
};

type UploadedImage = {
  fileUrl: string;
  fileId: string;
};

const CreateProduct = () => {
  const [openImageModal, setOpenImageModal] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [images, setImages] = useState<(UploadedImage | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const defaultValues: FormData = {
    discountCodes: [],
    title: '',
    description: '',
    tags: '',
    warranty: '',
    slug: '',
    brand: '',
    cashOnDelivery: 'yes',
    category: '',
    subcategory: '',
    detailedDescription: '',
    videoUrl: '',
    regularPrice: 0,
    salePrice: 0,
    stock: 1,
    images: [null],
    colors: [],
    specifications: [],
    properties: [],
    sizes: [],
  };

  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const convertFileToBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (file: File | null, index: number) => {
    if (!file) return;
    setIsUploading(true);

    try {
      const base64 = await convertFileToBase64(file);
      const response = await axiosInstance.post(
        '/products/upload-product-image',
        { fileName: base64 }
      );
      const updatedImages = [...images];

      const uploadedFile = {
        fileUrl: response.data.fileUrl,
        fileId: response.data.fileId,
      };

      updatedImages[index] = uploadedFile;

      if (index == images.length - 1 && images.length < 8) {
        updatedImages.push(null);
      }
      setImages(updatedImages);
      setValue('images', updatedImages);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    setIsDeleting(true);
    try {
      const updatedImages = [...images];

      const imageToRemove = updatedImages[index];

      if (imageToRemove && typeof imageToRemove === 'object') {
        await axiosInstance.delete(
          `/products/delete-product-image/${imageToRemove.fileId}`
        );
      }

      updatedImages.splice(index, 1);

      if (updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }

      setImages(updatedImages);
      setValue('images', updatedImages);
    } catch (error) {
      console.error('Error removing image:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveDraft = () => {};

  const {
    data,
    isError: isCategoryError,
    error: categoryError,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/products/get-categories');
        return response.data;
      } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const categories = data?.categories || [];
  const subCategories = data?.subCategories || {};

  const selectedCategory = watch('category');
  const regularPrice = watch('regularPrice');

  const subcategories = useMemo(() => {
    return selectedCategory ? subCategories[selectedCategory] || [] : [];
  }, [selectedCategory, subCategories]);

  const { data: discountCodes, isLoading: isDiscountLoading } = useQuery({
    queryKey: ['discount-codes'],
    queryFn: async () => {
      const response = await axiosInstance.get('/products/get-discount-codes');
      return response.data.discountCodes;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const applyTransformation = async (effect: string) => {
    if (isProcessing || !selectedImage) return;
    setIsProcessing(true);
    setActiveEffect(effect);

    try {
      const transformedUrl = `${selectedImage}?tr=${effect}`;
      setSelectedImage(transformedUrl);
    } catch (error) {
      console.error('Error applying transformation:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        cashOnDelivery: data.cashOnDelivery === 'yes',
        images: (data.images || []).filter(
          (img) => img && img.fileId && img.fileUrl
        ),
      };
      await axiosInstance.post('/products/create-product', payload);
      router.push('/dashboard/all-products');
      toast.success('Product created successfully');
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        'Something went wrong';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
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
      <Breadcrumb title="Create Product" />
      {/* Content Layout */}
      <div className="py-4 w-full flex gap-6">
        {/* Left side - Image upload */}
        <div className="md:w-[35%]">
          {images.length < 8 && (
            <ImagePlaceholder
              setOpenImageModal={setOpenImageModal}
              size="765 x 850"
              small={false}
              index={0}
              isUploading={isUploading}
              isDeleting={isDeleting}
              images={images}
              setSelectedImage={setSelectedImage}
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
                isUploading={isUploading}
                isDeleting={isDeleting}
                images={images}
                key={index}
                setSelectedImage={setSelectedImage}
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
                type="text"
                label="Product Title *"
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
                      value: 100,
                      message: `Slug cannot go beyond 100 characters`,
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
                <ColorPicker control={control} errors={errors} />
              </div>
              <div className="mt-2">
                <CustomSpecifications control={control} errors={errors} />
              </div>
              <div className="mt-2">
                <CustomProperties control={control} errors={errors} />
              </div>
              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Cash on Delivery
                </label>
                <select
                  defaultValue="yes"
                  {...register('cashOnDelivery', {
                    required: `Cash on Delivery is required`,
                  })}
                  className="w-full p-2 rounded-md border border-gray-700 bg-black outline-none"
                >
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
                {errors.cashOnDelivery && (
                  <p className="text-error">
                    {String(errors.cashOnDelivery.message)}
                  </p>
                )}
              </div>
            </div>
            <div className="w-2/4">
              <div>
                <label className="block font-semibold text-gray-300 mb-1">
                  Category *
                </label>
                {isLoading ? (
                  <div className="text-gray-400 flex items-center justify-center">
                    <LoaderCircle size={20} className="animate-spin" />
                  </div>
                ) : isCategoryError ? (
                  <p className="text-error">{String(categoryError?.message)}</p>
                ) : (
                  <Controller
                    control={control}
                    name="category"
                    rules={{
                      required: `Category is required`,
                    }}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full border border-gray-700 outline-none bg-black p-2 rounded-md"
                      >
                        <option value="">Select Category</option>
                        {categories.map((category: string) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                )}
                {errors.category && (
                  <p className="text-error">
                    {String(errors.category.message)}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Sub Category *
                </label>
                <Controller
                  control={control}
                  name="subcategory"
                  rules={{
                    required: `Sub Category is required`,
                  }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border border-gray-700 outline-none bg-black p-2 rounded-md"
                    >
                      <option value="">Select Sub Category</option>
                      {subcategories.map((subcategory: string) => (
                        <option key={subcategory} value={subcategory}>
                          {subcategory}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.subcategory && (
                  <p className="text-error">
                    {String(errors.subcategory.message)}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Detailed description *
                </label>
                <Controller
                  control={control}
                  name="detailedDescription"
                  rules={{
                    required: `Detailed description is required`,
                    validate: (value) => {
                      const wordCount = value
                        .split(/\s+/)
                        .filter((word: string) => word).length;
                      return (
                        wordCount >= 100 ||
                        `Description cannot be less than 100 words (Current: ${wordCount})`
                      );
                    },
                  }}
                  render={({ field }) => <RichTextEditor {...field} />}
                />
                {errors.detailedDescription && (
                  <p className="text-error">
                    {String(errors.detailedDescription.message)}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <Input
                  label="Video URL"
                  placeholder="https://www.youtoube.com/embed/something"
                  {...register('videoUrl', {
                    pattern: {
                      value:
                        /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-]{11}$/,
                      message: `Invalid YouTube URL`,
                    },
                  })}
                />
                {errors.videoUrl && (
                  <p className="text-error">
                    {String(errors.videoUrl.message)}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <Input
                  label="Regular Price"
                  placeholder="$20"
                  {...register('regularPrice', {
                    required: `Regular Price is required`,
                    valueAsNumber: true,
                    min: { value: 1, message: `Price must be greater than 0` },
                    validate: (value) =>
                      !isNaN(value) || `Only numbers are allowed`,
                  })}
                />
                {errors.regularPrice && (
                  <p className="text-error">
                    {String(errors.regularPrice.message)}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <Input
                  label="Sale Price"
                  placeholder="$20"
                  {...register('salePrice', {
                    required: `Sale Price is required`,
                    valueAsNumber: true,
                    min: { value: 1, message: `Price must be greater than 0` },
                    validate: (value) => {
                      if (isNaN(value)) return `Only numbers are allowed`;
                      if (regularPrice && value >= regularPrice)
                        return `Sale price must be less than regular price`;
                      return true;
                    },
                  })}
                />
                {errors.salePrice && (
                  <p className="text-error">
                    {String(errors.salePrice.message)}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <Input
                  label="Stock *"
                  placeholder="100"
                  {...register('stock', {
                    required: `Stock is required`,
                    valueAsNumber: true,
                    min: { value: 1, message: `Stock must be at least 1` },
                    max: { value: 1000, message: `Stock cannot exceed 1000` },
                    validate: (value) => {
                      if (isNaN(value)) return `Only numbers are allowed`;
                      if (!Number.isInteger(value))
                        return `Stock must be a whole number`;
                      return true;
                    },
                  })}
                />
                {errors.stock && (
                  <p className="text-error">{String(errors.stock.message)}</p>
                )}
              </div>
              <div className="mt-2">
                <SizeSelector control={control} errors={errors} />
              </div>
              <div className="mt-3">
                <label className="block font-semibold text-gray-300 mb-1">
                  Select Discount Codes (Optional)
                </label>
                {isDiscountLoading ? (
                  <div className="text-gray-400 flex items-center justify-center">
                    <LoaderCircle size={20} className="animate-spin" />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {discountCodes.map((code: any) => (
                      <button
                        key={code.id}
                        className={`px-3 py-1 rounded-md text-sm font-semibold border ${
                          watch('discountCodes').includes(code.id)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-700 text-gray-300 border-gray-600 hover:border-gray-700'
                        }`}
                        onClick={() => {
                          const currentSelection = watch('discountCodes') || [];
                          const updatedSelection = currentSelection?.includes(
                            code.id
                          )
                            ? currentSelection.filter(
                                (id: string) => id !== code.id
                              )
                            : [...currentSelection, code.id];
                          setValue('discountCodes', updatedSelection);
                        }}
                      >
                        {code.publicName} ({code.discountValue}{' '}
                        {code.discountType === 'percentage' ? '%' : '$'})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {openImageModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-[450px] text-white">
            <div className="flex justify-between items-center pb-3 mb-4">
              <h2 className="text-lg font-semibold">Enhance product image</h2>
              <X
                size={20}
                className="cursor-pointer"
                onClick={() => setOpenImageModal(false)}
              />
            </div>
            <div className="relative w-full h-[250px] rounded-md overflow-hidden border border-gray-600">
              {selectedImage && (
                <Image src={selectedImage} alt="selected image" layout="fill" />
              )}
            </div>
            {selectedImage && (
              <div className="mt-4 space-y-2">
                <h3 className="text-white text-sm font-semibold">
                  AI Enhancements
                </h3>
                <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto">
                  {aiEnhancements.map(({ label, effect }) => (
                    <button
                      key={effect}
                      className={`p-2 rounded-md flex items-center gap-2 whitespace-nowrap ${
                        activeEffect === effect
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                      onClick={() => applyTransformation(effect)}
                      disabled={isProcessing}
                    >
                      <Wand size={18} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="mt-6 flex justify-end gap-3">
        {isChanged && (
          <button
            type="button"
            className="bg-gray-700 text-white px-4 py-2 rounded-md"
            onClick={handleSaveDraft}
          >
            Save Draft
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <LoaderCircle size={20} className="animate-spin" />
          ) : (
            'Save Product'
          )}
        </button>
      </div>
    </form>
  );
};

export default CreateProduct;
