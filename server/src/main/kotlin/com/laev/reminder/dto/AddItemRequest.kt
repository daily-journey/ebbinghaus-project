package com.laev.reminder.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank

class AddItemRequest(
    @field:NotBlank(message = "Main text must not be blank")
    @Schema(example = "Banana")
    val mainText: String,

    @Schema(example = "바나나", nullable = true)
    val subText: String?,
)