export function formatNumber(amount) {
    return amount === null || amount === void 0 ? void 0 : amount.toLocaleString("en-US", {
        maximumFractionDigits: 0,
    });
}

export function getInitials(name) { 
    const words = name.trim().split(" ");
    const firstTwoWords = words.slice(0, 2);
    const initials = firstTwoWords.map((word) => word.charAt(0).toUpperCase());
    return initials.join("");
}

export function formatDateTime(isoDate) {
    const date = new Date(isoDate);
    const options = {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
    };
    return date.toLocaleString("en-US", options);
}

export function calculateAge(dob) {
    const today = new Date();
    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();

    if (months < 0) {
        years--;
        months += 12;
    }

    if (months === 0 && today.getDate() < dob.getDate()) {
        years--;
        months = 11;
    }

    if (years === 0) {
        return `${months} months old`;
    }

    let ageString = `${years} years`;

    if (months > 0) {
        ageString += ` ${months} months`;
    }

    return ageString + " old";
}

export const daysOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
];

export function generateRandomColor() {
    var hexColor = "";
    do {
        var randomInt = Math.floor(Math.random() * 16777216);
        hexColor = "#".concat(randomInt.toString(16).padStart(6, "0"));
    } while (hexColor.toLowerCase() === "#ffffff" ||
        hexColor.toLowerCase() === "#000000"); // Ensure it's not white or black
    return hexColor;
}

function formatTime(hour, minute) {
    const period = hour >= 12 ? "PM" : "AM";
    const adjustedHour = hour % 12 || 12;
    const formattedMinute = minute.toString().padStart(2, "0");
    return `${adjustedHour}:${formattedMinute} ${period}`;
}

export function generateTimes(start_hour, close_hour, interval_in_minutes) {
    const times = [];
    const startHour = start_hour;
    const endHour = close_hour;
    const intervalMinutes = interval_in_minutes;

    for (let hour = startHour; hour <= endHour; hour++) {
        for (let minute = 0; minute < 60; minute += intervalMinutes) {
            if (hour === endHour && minute > 0) break;
            const formattedTime = formatTime(hour, minute);
            times.push({ label: formattedTime, value: formattedTime });
        }
    }

    return times;
}

export function calculateBMI(weight, height) {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);

    let status;
    let colorCode;

    if (bmi < 18.5) {
        status = "Underweight";
        colorCode = "#1E90FF";
    } else if (bmi >= 18.5 && bmi <= 24.9) {
        status = "Normal";
        colorCode = "#1E90FF";
    } else if (bmi >= 25 && bmi <= 29.9) {
        status = "Overweight";
        colorCode = "#FF9800";
    } else {
        status = "Obesity";
        colorCode = "#FF5722";
    }

    return {
        bmi: parseFloat(bmi.toFixed(2)),
        status,
        colorCode,
    };
}

export function calculateDiscount({ amount, discount, discountPercentage }) {
    if (discount != null && discountPercentage != null) {
        throw new Error(
            "Provide either discount amount or discount percentage, not both."
        );
    }

    if (discount != null) {
        // Calculate discount percentage if a discount amount is provided
        const discountPercent = (discount / amount) * 100;
        return {
            finalAmount: amount - discount,
            discountPercentage: discountPercent,
            discountAmount: discount,
        };
    } else if (discountPercentage != null) {
        // Calculate discount amount if a discount percentage is provided
        const discountAmount = (discountPercentage / 100) * amount;
        return {
            finalAmount: amount - discountAmount,
            discountPercentage,
            discountAmount,
        };
    } else {
        throw new Error(
            "Please provide either a discount amount or a discount percentage."
        );
    }
} 