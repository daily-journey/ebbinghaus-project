package com.laev.reminder.integration

import com.laev.reminder.dto.AddItemRequest
import com.laev.reminder.entity.ReviewItem
import com.laev.reminder.repository.MemorizationLogRepository
import com.laev.reminder.repository.ReviewDatetimeRepository
import com.laev.reminder.repository.ReviewItemRepository
import com.laev.reminder.utils.ObjectMapperUtil
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import java.time.ZoneOffset

@SpringBootTest
@AutoConfigureMockMvc
class ReviewItemTest(
    @Autowired private val reviewItemRepository: ReviewItemRepository,
    @Autowired private val memorizationLogRepository: MemorizationLogRepository,
    @Autowired private val reviewDatetimeRepository: ReviewDatetimeRepository,
) : BaseIntegrationTest() {
    private val objectMapper = ObjectMapperUtil.createObjectMapper()

    @BeforeEach
    fun setUp() {
        val testMember = createOrGetMember("test@example.com")
        reviewItemRepository.save(
            ReviewItem(
                mainText = "setup item",
                subText = "",
                reviewDates = "",
                member = testMember,
            )
        )
    }

    @AfterEach
    fun tearDown() {
        memorizationLogRepository.deleteAll()
        reviewDatetimeRepository.deleteAll()
        reviewItemRepository.deleteAll()
    }

    @Test
    fun `save item to database`() {
        val request = AddItemRequest(
            mainText = "TestCode Item",
            subText = "Sub Text",
            offset = ZoneOffset.of("-05:00"),
        )

        mockMvc.perform(
            withAuth(
                MockMvcRequestBuilders.post("/review-items")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
        ).andExpect(MockMvcResultMatchers.status().isCreated)
    }

    @Test
    fun `fetch items from database`() {
        mockMvc.perform(
            withAuth(
                MockMvcRequestBuilders.get("/review-items")
                    .accept(MediaType.APPLICATION_JSON)
            )
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
            // Check the type and presence of each field
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].id").isNumber)
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].mainText").isString)
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].subText").isString)
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].createdDatetime").isString)
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].successCount").isNumber)
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].failCount").isNumber)
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].reviewDates").isArray)
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].isRecurring").isBoolean)
    }
}