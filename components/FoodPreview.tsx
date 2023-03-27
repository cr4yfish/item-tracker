import { User, Button } from "@nextui-org/react";
import { useState, useEffect } from "react";
import Image from "next/image";

import IItem from "@/interfaces/IItem";
import ICategory from "@/interfaces/ICategory";

import { getCategories } from "@/functions/Supabase";
import { deleteItem } from "@/functions/Supabase";
import { getImage } from "@/functions/FoodDatabase";

import styles from "@/styles/FoodPreview.module.css";

export default function FoodPreview (
  { 
    food, 
    onClick=() => {}, 
    className="", 
    size="small"
  } : { 
    food: IItem, 
    onClick?: Function, 
    className?: string,
    size?: "small" | "medium" | "large"
  }) {

    const [categories, setCategories] = useState<ICategory[]>([]);
    const [expandedVisible, setExpandedVisible] = useState<boolean>(false);

    useEffect(() => {
      getCategories().then((res) => {
        setCategories(res as ICategory[]);
      })
      if(!food.image || food.image?.length == 0) {
        const image = getImage(food.name);
        food.image = image;
      }
    }, [])

    switch(size) {
      case "small":
        return (
          <>
            {food && 
              <User 
                src={food.image}
                name={food.name}
                description={food.place}
                onClick={() => onClick(food)}
                className={className}
              />
            }
          </>
        )
      case "medium":
        return (
          <>
            {food && food.image &&
            <>
            <div 
              onMouseOver={() => setExpandedVisible(true)} 
              onMouseLeave={() => setExpandedVisible(false)}
              className={`${styles.foodPreview} ${className}`}>


              {expandedVisible && <div className={styles.foodPreviewExpanded}>
                <div className={styles.header}>
                  <div className={styles.imageExpanded}>
                    <Image fill alt={food.name} src={food.image} />
                  </div>
                  <div className={styles.headerText}>
                    <span className={styles.foodName}>{food.name}</span>
                    <span className={styles.foodPlace}>{food.place}</span>
                  </div>
                </div>

                <div className={styles.details}>

                  <div className={styles.detailsGroup}>
                    <span className={styles.detailsValue}>{new Date(food.date).toDateString()}</span>
                    <span className={styles.detailsLabel}>Date</span>
                  </div>

                  <div className={styles.detailsGroup}>
                    <span className={styles.detailsValue}>{food.count}</span>
                    <span className={styles.detailsLabel}>Amount</span>
                  </div>

                  <div className={styles.detailsGroup}>
                    <span className={styles.detailsValue}>
                      {categories.filter((category) => category.id == food.category )[0]?.name}
                    </span>
                    <span className={styles.detailsLabel}>Category</span>
                  </div>

                </div>

                <div className={styles.buttons}>
                  <Button onClick={() => deleteItem(food)} color="error" auto><span className="material-icons">delete</span></Button>
                  <Button disabled color="warning" auto><span className="material-icons">edit</span></Button>
                </div>
              </div>}

              <div 
                className={styles.image}
                >
                <Image fill alt={food.name} src={food.image} />
              </div>
              <div className={styles.info}>
                <span>{food.name}</span>
              </div>
            </div>


              </>
            }
          </>
        )
      default:
        return (
          <>
            <p>No size given for {food.name} preview!</p>
          </>
        )
    }
}