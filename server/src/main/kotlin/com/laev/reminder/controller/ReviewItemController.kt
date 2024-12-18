package com.laev.reminder.controller

import com.laev.reminder.dto.AddItemRequest
import com.laev.reminder.dto.GetItemsResponse
import com.laev.reminder.dto.UpdateMemorizationRequest
import com.laev.reminder.service.AuthService
import com.laev.reminder.service.ReviewItemService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import jakarta.validation.Valid
import jakarta.validation.constraints.NotNull
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.OffsetDateTime

@RestController
@RequestMapping("/review-items")
class ReviewItemController(
    private val reviewItemService: ReviewItemService,
    private val authService: AuthService,
) {
    @GetMapping
    @Operation(summary = "Get items", description = "Fetch all items or items for a specific date.")
    fun getItems(
        @RequestHeader("Authorization") authorizationHeader: String,
        @RequestParam(required = false)
        @Parameter(description = "ISO datetime", example = "2024-11-18T05:00:00Z")
        datetime: OffsetDateTime?
    ): ResponseEntity<List<GetItemsResponse>> {
        val responseHeaders = HttpHeaders()
        responseHeaders.set("Content-Type", "application/json")

        val member = authService.getMemberFromToken(authorizationHeader)
        val items = reviewItemService.getReviewItems(datetime, member)

        return ResponseEntity.ok()
            .headers(responseHeaders)
            .body(
                items.map { item ->
                    val count = reviewItemService.getReviewItemMemorizationCount(item.id!!)
                    GetItemsResponse(
                        id = item.id ?: 0,
                        mainText = item.mainText,
                        subText = item.subText,
                        createdDatetime = item.createdDatetime,
                        successCount = count.successCount,
                        failCount = count.failCount,
                        isRecurring = item.isRecurring,
                        reviewDates = item.reviewDates
                            .removePrefix("[").removeSuffix("]")
                            .split(", "),
                    )
                }
            )
    }

    @PostMapping
    @Operation(summary = "Add an item")
    fun addItem(
        @RequestBody @Valid request: AddItemRequest,
        @RequestHeader("Authorization") authorizationHeader: String,
    ): ResponseEntity<Void> {
        val member = authService.getMemberFromToken(authorizationHeader)
        reviewItemService.addReviewItem(request, member)

        return ResponseEntity.status(HttpStatus.CREATED).build()
    }

    @PatchMapping("/{id}/memorization")
    @Operation(summary = "Mark an item as memorized or not")
    fun updateMemorization(
        @RequestBody @Valid request: UpdateMemorizationRequest,
        @PathVariable @NotNull(message = "Item id cannot be null") id: Long,
    ): ResponseEntity<Void> {
        reviewItemService.updateMemorization(id, request.isMemorized!!, request.offset)
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build()
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an item")
    fun deleteItem(
        @PathVariable @NotNull(message = "Item id cannot be null") id: Long,
    ): ResponseEntity<String> {
        reviewItemService.deleteReviewItem(id)
        return ResponseEntity.ok("Item deleted successfully.")
    }
}
