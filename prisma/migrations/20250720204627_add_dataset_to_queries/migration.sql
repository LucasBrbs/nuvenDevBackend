/*
  Warnings:

  - Added the required column `dataset_id` to the `queries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "queries" ADD COLUMN     "dataset_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "queries" ADD CONSTRAINT "queries_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "datasets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
