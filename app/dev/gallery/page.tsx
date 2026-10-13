import { SeatMapGallery } from "@/components/booking/SeatMapGallery";
import styles from "./gallery-page.module.css";

export default function GalleryPage() {
  return (
    <div className={styles.page}>
      <SeatMapGallery />
    </div>
  );
}
