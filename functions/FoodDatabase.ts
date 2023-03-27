
const endpoint = "https://api.edamam.com/api/food-database/v2/parser";

const getUrl = (text: string, appId: string, appKey: string) => `${endpoint}?ingr=${text}&app_id=${appId}&app_key=${appKey}`

// Returns information about a food item using NLP
async function getFoodNLP(text: string, appId : string, appKey : string) {
    try {
        const response = await fetch(getUrl(text, appId, appKey), {
            method: "GET",
        })

        if (response.status === 200) {
            return await response.json();
        } else {
            throw new Error("Error getting food information");
        }
    } catch(e) {
        console.error("Error fetching food database. Error:", e);
        return false;
    }
}

function getImage(foodName : string) {
    const url = `https://www.themealdb.com/images/ingredients/${foodName}.png`;
    return url;
}

export { getFoodNLP, getImage };