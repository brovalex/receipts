'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button, Label, TextInput } from "flowbite-react";
import { ProductPriceProofWithRelationships } from '@/types/productPriceProof.d';

export default function ReviewPage() {
  const [proofs, setProofs] = useState<ProductPriceProofWithRelationships[]>([]);

  useEffect(() => {
    fetchProofs();
  }, []);

  const fetchProofs = async () => {
    try {
      const response = await fetch('/api/price-proofs');
      const data = await response.json();
      setProofs(data);
    } catch (error) {
      console.error('Error fetching proofs:', error);
    }
  };

  const handleValidate = async (proofId: string, validated: boolean) => {
    try {
      const response = await fetch(`/api/price-proofs/${proofId}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ validated }),
      });
      if (response.ok) {
        // Refresh the list after validation
        fetchProofs();
      }
    } catch (error) {
      console.error('Error validating proof:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Review Price Proofs</h1>
      <div className="grid gap-6">
        {proofs.filter(proof => proof.validated === null).map((proof) => (
          <div key={proof.id} className="border rounded-lg p-4 shadow-sm bg-white">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold">Product Name</h3>
                <p>{proof.name}</p>
              </div>
              <div>
                <h3 className="font-semibold">Quantity</h3>
                <p>{proof.quantity} {proof.unitOfMeasure}</p>
              </div>
              <div>
                <h3 className="font-semibold">Price</h3>
                <p>${Number(proof.price).toFixed(2)}</p>
              </div>
              <div>
                <h3 className="font-semibold">Reference URL</h3>
                <a 
                  href={proof.referenceURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Source
                </a>
                <h3 className="font-semibold mt-2">Reference Item</h3>
                <p>{proof.referenceItem?.name} ({proof.referenceItemId})</p>
              </div>
              <div>
                <h3 className="font-semibold">Created At</h3>
                <p>{proof.createdAt}</p>
              </div>
            </div>
            
            {proof.screenshot && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Screenshot</h3>
                <div className="relative h-96 w-full">
                  <Image
                    src={`/screenshots/${proof.screenshot}`}
                    alt="Price proof screenshot"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}
            
            <div className="mt-4">
              <Button
                onClick={() => handleValidate(proof.id, true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Validate
              </Button>
              <Button
                onClick={() => handleValidate(proof.id, false)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
