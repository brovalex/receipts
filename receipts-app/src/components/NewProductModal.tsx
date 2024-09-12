import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { Button, Label, TextInput, Modal, Select } from "flowbite-react";
import { default as ReactSelect } from 'react-select';
import { StylesConfig } from 'react-select';

interface NewProductFormInputs {
    newProductName: string;
    weight: string; // will be converted to a float
    unitOfMeasure: string;
    referenceItem: string;
}

interface Option {
    readonly label: string;
    readonly value: string;
}

const createOption = (label: string, id: number) => ({
    label,
    value: id,
});

interface NewProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
}

const NewProductModal: React.FC<NewProductModalProps> = ({ isOpen, onClose }) => {
    const { register, control, handleSubmit, formState: { errors } } = useForm<NewProductFormInputs>();

    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState<Option | null>();
    const [referenceItem, setReferenceItem] = useState<Option | unknown>();

    // TODO: eww, copy paste
    const customStyles: StylesConfig = {
        control: (provided, state) => ({
          ...provided,
          padding: '0.25rem',
          borderRadius: '0.375rem', // rounded-md
          backgroundColor: 'rgb(249, 250, 251)',
        }),
        input: (provided, state) => ({
            ...provided,
            boxShadow: 'none',
        }),
      };

    useEffect(() => {
        fetch('/api/referenceItem')
            .then((res) => res.json())
            .then((data) => {
                const options = data.map((referenceItem: any) => createOption(referenceItem.name, referenceItem.id));
                setOptions(options);
                console.log('Reference items:', options);
            })
            .catch((error) => console.error('Error fetching reference items:', error));
    }, []);

    const handleFormSubmit = (data: NewProductFormInputs) => {
        // onSubmit(data);
        onClose();
    };

    return (
        <Modal show={isOpen} onClose={onClose}>
            <Modal.Header>Add new product</Modal.Header>
            <Modal.Body>
                <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit(handleFormSubmit)}>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="newProductName" value="Product" />
                        </div>
                        <TextInput 
                            id="newProductName" 
                            {...register('newProductName', { required: false })}
                            type="" 
                        />
                    </div>
                    <div className="flex space-x-4">
                        <div className="w-1/2">
                            <div className="mb-2 block">
                                <Label htmlFor="weight" value="Weight" />
                            </div>
                            <TextInput 
                                id="weight" 
                                {...register('weight', { required: true })}
                                type="number" 
                            />
                            {errors.weight && <span>This field is required</span>}
                        </div>
                        <div className="w-1/2">
                            <div className="mb-2 block">
                                <Label htmlFor="unitOfMeasure" value="Unit of measure" />
                            </div>
                            <Select 
                            id="unitOfMeasure" 
                            {...register('unitOfMeasure', { required: true })}
                            required>
                                <option value="count">count</option>
                                <option value="g">g</option>
                                <option value="mL">mL</option>
                            </Select>
                        </div>
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="referenceItem" value="Reference item" />
                        </div>
                        <Controller 
                            name="referenceItem" 
                            control={control}
                            render={({ field }) => <ReactSelect 
                                {...field}
                                inputId="referenceItem"
                                instanceId="referenceItem"
                                isClearable
                                isDisabled={isLoading}
                                isLoading={isLoading}
                                options={options}
                                onChange={(newValue) => setReferenceItem(newValue)}
                                value={referenceItem}
                            />}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button type="submit">Add</Button>
                        <Button color="light">Cancel</Button>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    );
};

export default NewProductModal;